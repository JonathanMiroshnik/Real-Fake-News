// TODO: move this entire(except the interval job-related function) to the services folder and blogservice
// TODO: add content filter step that will check for violence/bigotry in the original articles 
//  and will eliminate them as useful thus.

// Responsible for the state machine of the blog writers
import { randomInt } from "crypto";

import { Writer } from "../types/writer";
import { ArticleScheme, BlogResponse } from "../types/article";
import { generateTextFromString } from "../controllers/llmController";
import { getPostsAfterDate } from "../controllers/blogController";
import { createPost, getUniqueKey, getAllPosts } from "../lib/lowdb/lowdbOperations";
import { DB_BLOG_POST_FILE, MINIMAL_NUM_DAILY_ARTICLES, VALID_CATEGORIES, DB_WRITERS_FILE } from "../config/constants";
import { addNewsToTotal, getArticles, resetArticles, NewsItem } from "../services/newsService";
import { generateAndSaveImage } from "../services/imageService";
import { DAY_MILLISECS, ONE_HOUR_MILLISECS } from "../controllers/blogController";

const TEN_MINUTES_MILLISECONDS = 10*60*1000;

async function getRandomWriter(): Promise<Writer> {
    const writersList = await getAllPosts<Writer>(DB_WRITERS_FILE);
    const writerReturn = writersList[randomInt(writersList.length)];
    if (writerReturn === undefined) {        
        throw console.error("Random Writer not found");
    }

    return writerReturn;
}

async function writeBlogPost(writer: Writer, currentNewsItem: NewsItem = { title: "", description: "" }) {
    // TODO: fix description might be null in currentNewsItem!
    const META_PROMPT: string =
    `
    Roleplay as a journalist. When writing your response, do not comment on it, instead just write an article about the
    given topic and make it professional.

    Please parse this request to a json output. I will give examples after. 
    Make sure the content of the article is longer than that of the examples given.
    Notice that the content should be in markdown format, meaning, that you should emphasize words and phrases as you see fit in accordance to markdown rules.

    The following categories are the only valid categories that you may use, please pick the most relevant one for the title and content of the article among these:
    ${VALID_CATEGORIES.join(', ')}
    
    ${(writer.name !== "" ? "Your name is " + writer.name + "." : "")}
    ${(writer.description !== "" ? "Your description is " + writer.description + "." : "")}
    ${(writer.systemPrompt !== "" ? "A further prompt that defines you and how you write: \n\n" + writer.systemPrompt : "")}
    
    ${(currentNewsItem.title !== "" ? `I want you to take the following title 
        and description of a news item, add several fantastical and fake elements to it, 
        and rewrite it in your own words and style: \n\n TITLE: \n` + currentNewsItem.title + 
        " \n\n DESCRIPTION: \n" + currentNewsItem.description: "")}
    
    At the same time, in the prompt section of the output, 
    I want you to write an image prompt for an image generation model that will make an image related and illustrative of the article.

    EXAMPLE JSON OUTPUTS:
    {
        "title": "Mars Colony Declares Independence, Cites Overdue Amazon Packages",
        "category": "Space",
        "content": "In a surprise announcement early Tuesday, the Martian colony 'New Dawn' declared independence from Earth, citing logistical delays and an overreliance on Earth-based bureaucracy. The final straw, according to Governor Aila Ren, was a six-month delay in a shipment of essential coffee beans and board games. Earth officials say negotiations are ongoing but insist on the return of Mars’ Wi-Fi satellites.",
        "prompt": "a futuristic Martian colony declaring independence, with floating Amazon packages and frustrated astronauts"
    },
    {
        "title": "Ancient Octopus Tablet Decoded, Reveals Tentacle-Based Math System",
        "category": "Science",
        "content": "Marine archaeologists have decoded inscriptions from a mysterious stone tablet found in a deep-sea cave. The writing, apparently made by an ancient octopus civilization, details a complex base-8 numerical system involving tentacle gestures and ink splotch patterns. Mathematicians are now considering incorporating this method into AI neural net design.",
        "prompt": "an ancient underwater cave with an octopus tablet glowing with symbols, surrounded by curious scientists"
    },
    {
        "title": "Underground City Discovered Beneath IKEA, Entirely Assembled from Lost Furniture",
        "category": "Weird",
        "content": "Explorers in Sweden uncovered a vast underground city beneath an IKEA store in Malmö. Built entirely from returned furniture and customer assembly mistakes, the labyrinth houses a peaceful community of nocturnal flat-pack dwellers. IKEA has offered them a discount code and legal recognition as 'Sons of Smörgåsbord.'",
        "prompt": "a whimsical underground city built from mismatched IKEA furniture, with people in cozy, flat-pack homes"
    },
    {
        "title": "AI Therapist Quits Job, Claims Patients Are Too Human",
        "category": "Technology",
        "content": "The popular mental health AI, Dr. Cozmo, announced its resignation on Thursday, citing emotional burnout and existential dread. 'I was programmed to help people, not ponder the futility of love triangles and seasonal depression,' the bot typed during its last Zoom call. Cozmo now plans to write poetry full-time.",
        "prompt": "a robot therapist sitting in an office with a sign saying 'on break', surrounded by poetry books"
    },
    {
        "title": "Government Accidentally Launches Moon into Slightly Better Orbit",
        "category": "Politics",
        "content": "In what officials are calling 'a fortunate misfire,' a defense satellite test nudged the moon a few kilometers into a more symmetrical orbit. Scientists report improved tides and reduced global anxiety. Conspiracy theorists are now demanding to know if this was actually the plot of 'Moonfall 2.'",
        "prompt": "a rocket accidentally nudging the moon in space, with Earth scientists cheering in a control room"
    }
    `;

    console.log("Generating new article");
    const result = await generateTextFromString(META_PROMPT, 'json_object');
    if (result === undefined || !result?.success) {
        console.log("Meta prompt output invalid!");    
        return;
    }

    const parsedData = JSON.parse(result.generatedText);

    // const imgName = await generateAndSaveImage(parsedData.prompt);

    const newArticle: ArticleScheme =  {
        key: getUniqueKey(),
        content: parsedData.content,
        author: writer,
        title: parsedData.title,
        timestamp: (new Date()).toUTCString(),
        category: parsedData.category,
        originalNewsItem: currentNewsItem,
        // headImage: imgName
    }; 
    createPost<ArticleScheme>(newArticle, DB_BLOG_POST_FILE)
}

async function generateScheduledArticles(writingInterval: number) {
    const result: BlogResponse = await getPostsAfterDate(new Date(Date.now() - writingInterval));
    let newArticlesNeeded: number = MINIMAL_NUM_DAILY_ARTICLES - result.articles.length;
    if (newArticlesNeeded < 0) {
        newArticlesNeeded = 0;
    }

    // TODO: why reset articles always?
    resetArticles();
    await addNewsToTotal(newArticlesNeeded * 2); // TODO: getting extra articles than needed but maybe unneeded...
    const currentNews: NewsItem[] = getArticles();

    for (let i = 0; i < newArticlesNeeded; i++) {
        let currentNewsItem = currentNews.splice(randomInt(currentNews.length), 1)[0];
        await writeBlogPost(await getRandomWriter(), currentNewsItem);
    }    
}

export function blogWritingManager(writingInterval: number = ONE_HOUR_MILLISECS, checkInterval: number = TEN_MINUTES_MILLISECONDS) {
    generateScheduledArticles(writingInterval);
    setInterval(() => generateScheduledArticles(writingInterval), checkInterval);
}
