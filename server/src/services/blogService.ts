import 'dotenv/config'

import { DB_BLOG_POST_FILE, DB_FEATURED_BLOG_POST_FILE, MINIMAL_NUM_DAILY_ARTICLES, VALID_CATEGORIES, DB_WRITERS_FILE } from '../config/constants.js';
import { ArticleScheme, FeaturedArticleScheme, BlogResponse } from '../types/article.js';
import { blogDatabaseConfig } from '../lib/lowdb/databaseConfigurations.js';
import { Writer } from "../types/writer.js";
import { generateTextFromString } from './llmService.js';
import { getAllPosts, createPost, getUniqueKey } from "../lib/lowdb/lowdbOperations.js";
import { addNewsToTotal, NewsItem } from "../services/newsService.js";
import { generateAndSaveImage } from "../services/imageService.js";

export async function getAllPostsAfterDate(startDate: Date): Promise<BlogResponse> {
    const allArticles: ArticleScheme[] = await getAllPosts<ArticleScheme>(blogDatabaseConfig);

    const retArticles = allArticles.filter(article => {
        if (!article.timestamp) return false;
        
        try {
            const articleDate = new Date(article.timestamp);
            const startTime = startDate.getTime();
            return articleDate.getTime() > startTime;
        } catch (e) {
            console.error('Invalid date format:', article.timestamp);
            return false;
        }
    });

    return {
        success: true,
        articles: retArticles,
        error: ""
    };
}

// TODO: add content filter step that will check for violence/bigotry in the original articles 
//  and will eliminate them as useful thus.

export async function writeBlogPost(writer: Writer, currentNewsItem: NewsItem = { article_id: "", title: "", description: "" }, saveArticle: boolean = true) {
    const prompt: string = writeBlogPostPrompt(writer, currentNewsItem);
    const newArticle = await createArticle(writer, currentNewsItem, prompt);
    if (newArticle === undefined) {
        return;
    }

    // Add new AI news article to AI news article database
    await createPost<ArticleScheme>(newArticle, blogDatabaseConfig);
    return newArticle;
}

async function createArticle(writer: Writer, currentNewsItem: NewsItem = { article_id: "", title: "", description: "" }, prompt: string) {
    console.log("Generating new article");
    const result = await generateTextFromString(prompt, 'json_object');
    if (result === undefined || !result?.success) {
        console.error("Meta prompt output invalid!");    
        return;
    } 

    const parsedData = JSON.parse(result.generatedText);
    const imgName = await generateAndSaveImage(parsedData.prompt);

    const newArticle: ArticleScheme =  {
        key: getUniqueKey(),
        content: parsedData.content,
        author: writer,
        title: parsedData.title,
        timestamp: (new Date()).toUTCString(),
        category: parsedData.category,
        originalNewsItem: currentNewsItem,
        shortDescription: parsedData.shortDescription,
        headImage: imgName
    };     

    return newArticle;
}

// ----------------------------------------------- FEATURED ARTICLES LOGIC -----------------------------------------------

// // TODO: choose random assortment of writers?
// // TODO: make special featured article prompt
// async function createFeaturedArticle(writers: Writer[], currentNewsItem: NewsItem = { title: "", description: "" }, prompt: string) {
//     const currentArticles : ArticleScheme[] = [];

//     for (let w of writers) {
//         const currentArticle = await writeBlogPost(w, currentNewsItem, false);
//         if (currentArticle === undefined) {
//             return;
//         }

//         currentArticles.push(currentArticle);
//     }
//     console.log("Generating new article");
//     const result = await generateTextFromString(prompt, 'json_object');
//     if (result === undefined || !result?.success) {
//         console.error("Meta prompt output invalid!");    
//         return;
//     } 

//     const parsedData = JSON.parse(result.generatedText);
//     const imgName = await generateAndSaveImage(parsedData.prompt);

//     const newFeaturedArticle: FeaturedArticleScheme =  {
//         key: getUniqueKey(),
//         content: currentArticles,
//         author: writers,
//         title: parsedData.title,
//         timestamp: (new Date()).toUTCString(),
//         category: parsedData.category,
//         originalNewsItem: currentNewsItem,
//         shortDescription: parsedData.shortDescription,
//         headImage: imgName
//     }; 

//     await createPost<FeaturedArticleScheme>(newFeaturedArticle, DB_FEATURED_BLOG_POST_FILE);
    
//     return newFeaturedArticle;
// }

// import { HumanMessage, SystemMessage } from "@langchain/core/messages";
// // import { ChatDeepSeek } from "@langchain/deepseek";

// // LangChain chat models for each writer
// const writerModel = new ChatDeepSeek({
//   model: "deepseek-chat",
//   temperature: 0.9, // higher temperature more creative
//   apiKey: import.meta.env.VITE_DEEPSEEK_KEY,
//   maxTokens: 200
//   // other params...
// });

// // Debate loop
// export async function runDebate(rounds: number = 2): Promise<string[]> {
//   const dialog: SystemMessage[] = [];

//   const [writerA, writerB] = getTwoRandom(writers);
//   const messagesA = getSystemPrompt(writerA);
//   const messagesB = getSystemPrompt(writerA);

//   // Rebuttal loop
//   for (let i = 0; i < rounds; i++) {
//     const msgResponse = await respondTo(writerA, writerB, messagesA, dialog);
//     dialog.push(msgResponse);
//     const msgResponse2 = await respondTo(writerA, writerB, messagesB, dialog);
//     dialog.push(msgResponse2);
//   }

//   return [...dialog.map(m=>m.content.toString())];
// }

// // Utility: get two random writers
// function getTwoRandom(arr: Writer[]): [Writer, Writer] {
//   const shuffled = [...arr].sort(() => 0.5 - Math.random());
//   return [shuffled[0], shuffled[1]];
// }


// ----------------------------------------------- PROMPT MAKING FUNCTIONS -----------------------------------------------

function writeBlogPostPrompt(writer: Writer, currentNewsItem: NewsItem = { article_id: "", title: "", description: "" }) {
    // TODO: fix description might be null in currentNewsItem!
    const META_PROMPT: string =
    `
    Roleplay as a journalist. When writing your response, do not comment on it, instead just write an article about the
    given topic and make it professional.\n\n

    Please parse this request to a json output. I will give examples after. \n
    Make sure the content of the article is longer than that of the examples given.\n
    Notice that the content should be in markdown format, meaning, that you should emphasize words and phrases as you see fit in accordance to markdown rules.\n\n

    The following categories are the only valid categories that you may use, please pick the most relevant one for the title and content of the article among these:\n
    ${VALID_CATEGORIES.join(', ')}\n\n
    
    ${(writer.name !== "" ? "Your name is " + writer.name + "." : "")}\n
    ${(writer.description !== "" ? "Your description is " + writer.description + "." : "")}\n
    ${(writer.systemPrompt !== "" ? "A further prompt that defines you and how you write: \n\n" + writer.systemPrompt : "")}\n
    
    ${currentNewsItem.title !== "" ? `I want you to take the following title of a news item, add several fantastical and fake elements to it, 
        and rewrite it in your own words and style: \n\n TITLE: \n` + currentNewsItem.title : ""}\n
    ${(currentNewsItem.description !== null && currentNewsItem.description !== "" ? `Additionally, take the following description of the news item, 
        and do the same, adding it to your context:` + "\n DESCRIPTION: \n" + currentNewsItem.description: "")}\n
    
    In the prompt section of the output, I want you to write an image prompt for an image generation model 
    that will make an image related and illustrative of the article.\n

    In the shortDescription section of the output, I want you to give a very short and catchy 1 or 2 line description of the contents of your article.\n

    Make sure that the title of the article is at most half the length of the short description.\n
    The short description should not have many repeated terms from the title. the title takes precedence in importance.\n

    EXAMPLE JSON OUTPUTS:\n
    {\n
        "title": "Mars Colony Declares Independence, Cites Overdue Amazon Packages",\n
        "category": "Space",\n
        "content": "In a surprise announcement early Tuesday, the Martian colony 'New Dawn' declared independence from Earth, 
        citing logistical delays and an overreliance on Earth-based bureaucracy. The final straw, according to Governor Aila Ren, 
        was a six-month delay in a shipment of essential coffee beans and board games. Earth officials say negotiations are 
        ongoing but insist on the return of Mars’ Wi-Fi satellites.",\n
        "prompt": "a futuristic Martian colony declaring independence, with floating Amazon packages and frustrated astronauts",\n
        "shortDescription": "A Martian colony declares independence after supply delays from Earth, citing missing coffee and board games."\n
    },\n
    {\n
        "title": "Ancient Octopus Tablet Decoded, Reveals Tentacle-Based Math System",\n
        "category": "Science",\n
        "content": "Marine archaeologists have decoded inscriptions from a mysterious stone tablet found in a deep-sea cave. 
        The writing, apparently made by an ancient octopus civilization, details a complex base-8 numerical system involving 
        tentacle gestures and ink splotch patterns. Mathematicians are now considering incorporating this method into AI neural net design.",\n
        "prompt": "an ancient underwater cave with an octopus tablet glowing with symbols, surrounded by curious scientists",\n
        "shortDescription": "A decoded octopus tablet reveals a base-8 math system using tentacles and ink, intriguing modern scientists."\n
    },\n
    {\n
        "title": "Underground City Discovered Beneath IKEA, Entirely Assembled from Lost Furniture",\n
        "category": "Weird",\n
        "content": "Explorers in Sweden uncovered a vast underground city beneath an IKEA store in Malmö. Built entirely from 
        returned furniture and customer assembly mistakes, the labyrinth houses a peaceful community of nocturnal flat-pack dwellers. 
        IKEA has offered them a discount code and legal recognition as 'Sons of Smörgåsbord.'",\n
        "prompt": "a whimsical underground city built from mismatched IKEA furniture, with people in cozy, flat-pack homes",\n
        "shortDescription": "A secret city made from returned IKEA furniture is found beneath a Swedish store, inhabited by peaceful dwellers."\n
    },\n
    {\n
        "title": "AI Therapist Quits Job, Claims Patients Are Too Human",\n
        "category": "Technology",\n
        "content": "The popular mental health AI, Dr. Cozmo, announced its resignation on Thursday, citing emotional 
        burnout and existential dread. 'I was programmed to help people, not ponder the futility of love triangles and 
        seasonal depression,' the bot typed during its last Zoom call. Cozmo now plans to write poetry full-time.",\n
        "prompt": "a robot therapist sitting in an office with a sign saying 'on break', surrounded by poetry books",\n
        "shortDescription": "An AI therapist resigns due to emotional overload and turns to writing poetry instead."
    },\n
    {\n
        "title": "Government Accidentally Launches Moon into Slightly Better Orbit",\n
        "category": "Politics",\n
        "content": "In what officials are calling 'a fortunate misfire,' a defense satellite test nudged the moon a few 
        kilometers into a more symmetrical orbit. Scientists report improved tides and reduced global anxiety. 
        Conspiracy theorists are now demanding to know if this was actually the plot of 'Moonfall 2.'",\n
        "prompt": "a rocket accidentally nudging the moon in space, with Earth scientists cheering in a control room",\n
        "shortDescription": "A satellite mishap improves the moon’s orbit, leading to better tides and amused conspiracy theories."
    }\n
    `;

    return META_PROMPT;
}

/**
 * @param editor The editor of the newspaper, 
 * responsible for the top portion of any featured article.
 * @param currentNewsItem The news item that becomes the basis for the featured article.
 * 
 * @returns Prompt for the top portion of a daily Featured article
 *
 * @explanation Featured articles have a roundtable approach, 
 * the top portion explains the theme broadly and each sub-article
 * goes into the opinion of the expert on the matter.
 * 
 * @see {@link http://example.com/@internal | the @internal tag}
 */
function writeFeaturedBlogTopPostPrompt(editor: Writer, currentNewsItem: NewsItem = { article_id: "", title: "", description: "" }) {
    // TODO: fix description might be null in currentNewsItem!
    const META_PROMPT: string =
    `
    Roleplay as a newspaper editor. When writing the portion, do not comment on it, instead just write the portion about the
    given topic and make it professional.\n\n

    Please parse this request to a json output. I will give examples after. \n
    Make sure the content of the article is longer than that of the examples given.\n
    Notice that the content should be in markdown format, meaning, that you should emphasize words and phrases as you see fit in accordance to markdown rules.\n\n

    The following categories are the only valid categories that you may use, please pick the most relevant one for the title and content of the article among these:\n
    ${VALID_CATEGORIES.join(', ')}\n\n
    
    ${(editor.name !== "" ? "Your name is " + editor.name + "." : "")}\n
    ${(editor.description !== "" ? "Your description is " + editor.description + "." : "")}\n
    ${(editor.systemPrompt !== "" ? "A further prompt that defines you and how you write: \n\n" + editor.systemPrompt : "")}\n
    
    ${currentNewsItem.title !== "" ? `I want you to take the following title of a news item, add several fantastical and fake elements to it, 
        and rewrite it in your own words and style: \n\n TITLE: \n` + currentNewsItem.title : ""}\n
    ${(currentNewsItem.description !== null && currentNewsItem.description !== "" ? `Additionally, take the following description of the news item, 
        and do the same, adding it to your context:` + "\n DESCRIPTION: \n" + currentNewsItem.description: "")}\n
    
    In the prompt section of the output, I want you to write an image prompt for an image generation model 
    that will make an image related and illustrative of the article.\n

    In the shortDescription section of the output, I want you to give a very short and catchy 1 or 2 line description of the contents of your article.\n

    Make sure that the title of the article is at most half the length of the short description.\n
    The short description should not have many repeated terms from the title. the title takes precedence in importance.\n

    EXAMPLE JSON OUTPUTS:\n
    {\n
        "title": "Mars Colony Declares Independence, Cites Overdue Amazon Packages",\n
        "category": "Space",\n
        "content": "In a surprise announcement early Tuesday, the Martian colony 'New Dawn' declared independence from Earth, 
        citing logistical delays and an overreliance on Earth-based bureaucracy. The final straw, according to Governor Aila Ren, 
        was a six-month delay in a shipment of essential coffee beans and board games. Earth officials say negotiations are 
        ongoing but insist on the return of Mars’ Wi-Fi satellites.",\n
        "prompt": "a futuristic Martian colony declaring independence, with floating Amazon packages and frustrated astronauts",\n
        "shortDescription": "A Martian colony declares independence after supply delays from Earth, citing missing coffee and board games."\n
    },\n
    {\n
        "title": "Ancient Octopus Tablet Decoded, Reveals Tentacle-Based Math System",\n
        "category": "Science",\n
        "content": "Marine archaeologists have decoded inscriptions from a mysterious stone tablet found in a deep-sea cave. 
        The writing, apparently made by an ancient octopus civilization, details a complex base-8 numerical system involving 
        tentacle gestures and ink splotch patterns. Mathematicians are now considering incorporating this method into AI neural net design.",\n
        "prompt": "an ancient underwater cave with an octopus tablet glowing with symbols, surrounded by curious scientists",\n
        "shortDescription": "A decoded octopus tablet reveals a base-8 math system using tentacles and ink, intriguing modern scientists."\n
    },\n
    {\n
        "title": "Underground City Discovered Beneath IKEA, Entirely Assembled from Lost Furniture",\n
        "category": "Weird",\n
        "content": "Explorers in Sweden uncovered a vast underground city beneath an IKEA store in Malmö. Built entirely from 
        returned furniture and customer assembly mistakes, the labyrinth houses a peaceful community of nocturnal flat-pack dwellers. 
        IKEA has offered them a discount code and legal recognition as 'Sons of Smörgåsbord.'",\n
        "prompt": "a whimsical underground city built from mismatched IKEA furniture, with people in cozy, flat-pack homes",\n
        "shortDescription": "A secret city made from returned IKEA furniture is found beneath a Swedish store, inhabited by peaceful dwellers."\n
    },\n
    {\n
        "title": "AI Therapist Quits Job, Claims Patients Are Too Human",\n
        "category": "Technology",\n
        "content": "The popular mental health AI, Dr. Cozmo, announced its resignation on Thursday, citing emotional 
        burnout and existential dread. 'I was programmed to help people, not ponder the futility of love triangles and 
        seasonal depression,' the bot typed during its last Zoom call. Cozmo now plans to write poetry full-time.",\n
        "prompt": "a robot therapist sitting in an office with a sign saying 'on break', surrounded by poetry books",\n
        "shortDescription": "An AI therapist resigns due to emotional overload and turns to writing poetry instead."
    },\n
    {\n
        "title": "Government Accidentally Launches Moon into Slightly Better Orbit",\n
        "category": "Politics",\n
        "content": "In what officials are calling 'a fortunate misfire,' a defense satellite test nudged the moon a few 
        kilometers into a more symmetrical orbit. Scientists report improved tides and reduced global anxiety. 
        Conspiracy theorists are now demanding to know if this was actually the plot of 'Moonfall 2.'",\n
        "prompt": "a rocket accidentally nudging the moon in space, with Earth scientists cheering in a control room",\n
        "shortDescription": "A satellite mishap improves the moon’s orbit, leading to better tides and amused conspiracy theories."
    }\n
    `;

    return META_PROMPT;
}

// TODO: this function should be in the blogService?

/**
 * @returns Prompt for a sub-subsection of a daily Featured article
 *
 * @explanation Featured articles have a roundtable approach, 
 * the top portion explains the theme broadly and each sub-subsection
 * goes into the opinion of the expert on the matter.
 * 
 * @see {@link http://example.com/@internal | the @internal tag}
 */
function writeFeaturedBlogSubPostPrompt(writer: Writer, currentNewsItem: NewsItem = { article_id: "", title: "", description: "" }) {
    // TODO: fix description might be null in currentNewsItem!
    const META_PROMPT: string =
    `
    Roleplay as a journalist. When writing your response, do not comment on it, instead just write an article about the
    given topic and make it professional.\n\n

    Please parse this request to a json output. I will give examples after. \n
    Make sure the content of the article is longer than that of the examples given.\n
    Notice that the content should be in markdown format, meaning, that you should emphasize words and phrases as you see fit in accordance to markdown rules.\n\n

    The following categories are the only valid categories that you may use, please pick the most relevant one for the title and content of the article among these:\n
    ${VALID_CATEGORIES.join(', ')}\n\n
    
    ${(writer.name !== "" ? "Your name is " + writer.name + "." : "")}\n
    ${(writer.description !== "" ? "Your description is " + writer.description + "." : "")}\n
    ${(writer.systemPrompt !== "" ? "A further prompt that defines you and how you write: \n\n" + writer.systemPrompt : "")}\n
    
    ${currentNewsItem.title !== "" ? `I want you to take the following title of a news item, add several fantastical and fake elements to it, 
        and rewrite it in your own words and style: \n\n TITLE: \n` + currentNewsItem.title : ""}\n
    ${(currentNewsItem.description !== null && currentNewsItem.description !== "" ? `Additionally, take the following description of the news item, 
        and do the same, adding it to your context:` + "\n DESCRIPTION: \n" + currentNewsItem.description: "")}\n
    
    In the prompt section of the output, I want you to write an image prompt for an image generation model 
    that will make an image related and illustrative of the article.\n

    In the shortDescription section of the output, I want you to give a very short and catchy 1 or 2 line description of the contents of your article.\n

    Make sure that the title of the article is at most half the length of the short description.\n
    The short description should not have many repeated terms from the title. the title takes precedence in importance.\n

    EXAMPLE JSON OUTPUTS:\n
    {\n
        "title": "Mars Colony Declares Independence, Cites Overdue Amazon Packages",\n
        "category": "Space",\n
        "content": "In a surprise announcement early Tuesday, the Martian colony 'New Dawn' declared independence from Earth, 
        citing logistical delays and an overreliance on Earth-based bureaucracy. The final straw, according to Governor Aila Ren, 
        was a six-month delay in a shipment of essential coffee beans and board games. Earth officials say negotiations are 
        ongoing but insist on the return of Mars’ Wi-Fi satellites.",\n
        "prompt": "a futuristic Martian colony declaring independence, with floating Amazon packages and frustrated astronauts",\n
        "shortDescription": "A Martian colony declares independence after supply delays from Earth, citing missing coffee and board games."\n
    },\n
    {\n
        "title": "Ancient Octopus Tablet Decoded, Reveals Tentacle-Based Math System",\n
        "category": "Science",\n
        "content": "Marine archaeologists have decoded inscriptions from a mysterious stone tablet found in a deep-sea cave. 
        The writing, apparently made by an ancient octopus civilization, details a complex base-8 numerical system involving 
        tentacle gestures and ink splotch patterns. Mathematicians are now considering incorporating this method into AI neural net design.",\n
        "prompt": "an ancient underwater cave with an octopus tablet glowing with symbols, surrounded by curious scientists",\n
        "shortDescription": "A decoded octopus tablet reveals a base-8 math system using tentacles and ink, intriguing modern scientists."\n
    },\n
    {\n
        "title": "Underground City Discovered Beneath IKEA, Entirely Assembled from Lost Furniture",\n
        "category": "Weird",\n
        "content": "Explorers in Sweden uncovered a vast underground city beneath an IKEA store in Malmö. Built entirely from 
        returned furniture and customer assembly mistakes, the labyrinth houses a peaceful community of nocturnal flat-pack dwellers. 
        IKEA has offered them a discount code and legal recognition as 'Sons of Smörgåsbord.'",\n
        "prompt": "a whimsical underground city built from mismatched IKEA furniture, with people in cozy, flat-pack homes",\n
        "shortDescription": "A secret city made from returned IKEA furniture is found beneath a Swedish store, inhabited by peaceful dwellers."\n
    },\n
    {\n
        "title": "AI Therapist Quits Job, Claims Patients Are Too Human",\n
        "category": "Technology",\n
        "content": "The popular mental health AI, Dr. Cozmo, announced its resignation on Thursday, citing emotional 
        burnout and existential dread. 'I was programmed to help people, not ponder the futility of love triangles and 
        seasonal depression,' the bot typed during its last Zoom call. Cozmo now plans to write poetry full-time.",\n
        "prompt": "a robot therapist sitting in an office with a sign saying 'on break', surrounded by poetry books",\n
        "shortDescription": "An AI therapist resigns due to emotional overload and turns to writing poetry instead."
    },\n
    {\n
        "title": "Government Accidentally Launches Moon into Slightly Better Orbit",\n
        "category": "Politics",\n
        "content": "In what officials are calling 'a fortunate misfire,' a defense satellite test nudged the moon a few 
        kilometers into a more symmetrical orbit. Scientists report improved tides and reduced global anxiety. 
        Conspiracy theorists are now demanding to know if this was actually the plot of 'Moonfall 2.'",\n
        "prompt": "a rocket accidentally nudging the moon in space, with Earth scientists cheering in a control room",\n
        "shortDescription": "A satellite mishap improves the moon’s orbit, leading to better tides and amused conspiracy theories."
    }\n
    `;

    return META_PROMPT;
}
