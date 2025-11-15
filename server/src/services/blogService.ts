import 'dotenv/config'

import { VALID_CATEGORIES } from '../config/constants.js';
import { ArticleScheme, FeaturedArticleScheme, BlogResponse } from '../types/article.js';
import { blogDatabaseConfig } from '../lib/lowdb/databaseConfigurations.js';
import { Writer } from "../types/writer.js";
import { generateTextFromString } from './llmService.js';
import { getAllPosts, createPost } from "../lib/database/sqliteOperations.js";
import { getUniqueKey } from '../utils/general.js';
import { NewsItem } from "../services/newsService.js";
import { generateAndSaveImage } from "../services/imageService.js";

export async function getAllPostsAfterDate(startDate: Date): Promise<BlogResponse> {
    console.log('🔍 [getAllPostsAfterDate] Start date:', startDate.toISOString());
    console.log('🔍 [getAllPostsAfterDate] Start time:', startDate.getTime());
    
    const allArticles: ArticleScheme[] = await getAllPosts<ArticleScheme>(blogDatabaseConfig);
    console.log('🔍 [getAllPostsAfterDate] Total articles in database:', allArticles.length);

    const retArticles = allArticles.filter(article => {
        if (!article.timestamp) {
            console.log('⚠️ [getAllPostsAfterDate] Article', article.key, 'has no timestamp');
            return false;
        }
        
        try {
            const articleDate = new Date(article.timestamp);
            const startTime = startDate.getTime();
            const articleTime = articleDate.getTime();
            const isAfter = articleTime > startTime;
            
            if (!isAfter) {
                console.log('⏰ [getAllPostsAfterDate] Article', article.key, 'timestamp', article.timestamp, 'is before start date');
            }
            
            return isAfter;
        } catch (e) {
            console.error('❌ [getAllPostsAfterDate] Invalid date format:', article.timestamp, 'Error:', e);
            return false;
        }
    });

    console.log('✅ [getAllPostsAfterDate] Filtered articles count:', retArticles.length);
    if (retArticles.length > 0) {
        console.log('📰 [getAllPostsAfterDate] Sample article timestamps:', 
            retArticles.slice(0, 3).map(a => ({ key: a.key, timestamp: a.timestamp })));
    }

    return {
        success: true,
        articles: retArticles,
        error: ""
    };
}

// TODO: add content filter step that will check for violence/bigotry in the original articles 
//  and will eliminate them as useful thus.

export async function writeBlogPost(writer: Writer, currentNewsItem: NewsItem = { article_id: "", title: "", description: "", pubDate: "", pubDateTZ: "" }, saveArticle: boolean = true) {    
    // const newArticle = await createArticle(writer, currentNewsItem);
    const newArticle = await generateNewsArticleWithExplanation(writer, currentNewsItem);
    if (newArticle === undefined) {
        return;
    }

    // Add new AI news article to AI news article database
    await createPost<ArticleScheme>(newArticle, blogDatabaseConfig);
    return newArticle;
}

async function createArticle(writer: Writer, currentNewsItem: NewsItem = { article_id: "", title: "", description: "", pubDate: "", pubDateTZ: "" }) {
    const prompt: string = writeBlogPostPrompt(writer, currentNewsItem);

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

// ----------------------------------------------- PROMPT MAKING FUNCTIONS -----------------------------------------------



function writeBlogPostPrompt(writer: Writer, currentNewsItem: NewsItem = { article_id: "", title: "", description: "", pubDate: "", pubDateTZ: "" }) {
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

// New article generation functions 20 October 2025

function writeNewsExplanationPrompt(writer: Writer, currentNewsItem: NewsItem = { article_id: "", title: "", description: "", pubDate: "", pubDateTZ: "" }) {
    const EXPLANATION_PROMPT: string =
    `
    Roleplay as a journalist. Analyze the given news story and provide a clear, concise explanation.\n\n

    ${(writer.name !== "" ? "Your name is " + writer.name + "." : "")}\n
    ${(writer.description !== "" ? "Your description is " + writer.description + "." : "")}\n
    ${(writer.systemPrompt !== "" ? "A further prompt that defines you and how you write: \n\n" + writer.systemPrompt : "")}\n
    
    ${currentNewsItem.title !== "" ? `Analyze the following news story:\n\n TITLE: \n` + currentNewsItem.title : ""}\n
    ${(currentNewsItem.description !== null && currentNewsItem.description !== "" ? `DESCRIPTION: \n` + currentNewsItem.description: "")}\n
    
    Based on this news story, provide a 3 to 5 point explanation that covers the key aspects of what happened. 
    Each point should be a clear, concise statement that explains a different aspect of the story.
    
    Focus on:
    - What happened (the main event)
    - Who was involved
    - When/where it occurred
    - Why it's significant or what caused it
    - What the implications or consequences are
    
    Format your response as a simple numbered list with no additional commentary or explanation beyond the points themselves.
    `;

    return EXPLANATION_PROMPT;
}

function writeNewsArticleFromExplanationPrompt(writer: Writer, explanationPoints: string[], currentNewsItem: NewsItem = { article_id: "", title: "", description: "", pubDate: "", pubDateTZ: "" }) {
    const EXPANSION_PROMPT: string =
    `
    Roleplay as a journalist. Expand the given explanation points into a full news article.\n\n

    ${(writer.name !== "" ? "Your name is " + writer.name + "." : "")}\n
    ${(writer.description !== "" ? "Your description is " + writer.description + "." : "")}\n
    ${(writer.systemPrompt !== "" ? "A further prompt that defines you and how you write: \n\n" + writer.systemPrompt : "")}\n
    
    ${currentNewsItem.title !== "" ? `Original news story:\n\n TITLE: \n` + currentNewsItem.title : ""}\n
    ${(currentNewsItem.description !== null && currentNewsItem.description !== "" ? `DESCRIPTION: \n` + currentNewsItem.description: "")}\n
    
    Please parse this request to a json output. I will give examples after.\n
    Make sure the content of the article is longer than that of the examples given.\n
    Notice that the content should be in markdown format, meaning, that you should emphasize words and phrases as you see fit in accordance to markdown rules.\n\n

    The following categories are the only valid categories that you may use, please pick the most relevant one for the title and content of the article among these:\n
    ${VALID_CATEGORIES.join(', ')}\n\n
    
    Based on these explanation points, expand each point into its own paragraph to create a full news article:\n
    ${explanationPoints.map((point, index) => `${index + 1}. ${point}`).join('\n')}\n\n
    
    IMPORTANT: Structure this as a proper news article with:\n
    - An engaging opening paragraph that hooks the reader and introduces the story\n
    - Body paragraphs that expand on each explanation point\n
    - A closing paragraph that wraps up the story and provides context or implications\n
    
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
        ongoing but insist on the return of Mars' Wi-Fi satellites.",\n
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
    }\n
    `;

    return EXPANSION_PROMPT;
}

// ----------------------------------------------- NEW FUNCTIONS FOR EXPLANATION AND EXPANSION -----------------------------------------------

export async function generateNewsExplanation(writer: Writer, currentNewsItem: NewsItem = { article_id: "", title: "", description: "", pubDate: "", pubDateTZ: "" }): Promise<string[] | undefined> {
    const prompt: string = writeNewsExplanationPrompt(writer, currentNewsItem);

    console.log("Generating news explanation");
    const result = await generateTextFromString(prompt, 'text');
    if (result === undefined || !result?.success) {
        console.error("News explanation generation failed!");    
        return undefined;
    } 

    // Parse the numbered list response into an array of explanation points
    const explanationText = result.generatedText.trim();
    const explanationPoints = explanationText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
            // Remove numbering (e.g., "1. ", "2. ", etc.)
            return line.replace(/^\d+\.\s*/, '');
        });

    return explanationPoints;
}

export async function generateNewsArticleFromExplanation(writer: Writer, explanationPoints: string[], currentNewsItem: NewsItem = { article_id: "", title: "", description: "", pubDate: "", pubDateTZ: "" }, saveArticle: boolean = true): Promise<ArticleScheme | undefined> {
    const prompt: string = writeNewsArticleFromExplanationPrompt(writer, explanationPoints, currentNewsItem);

    console.log("Generating news article from explanation");
    const result = await generateTextFromString(prompt, 'json_object');
    if (result === undefined || !result?.success) {
        console.error("News article generation from explanation failed!");    
        return undefined;
    } 

    const parsedData = JSON.parse(result.generatedText);
    const imgName = await generateAndSaveImage(parsedData.prompt);

    const newArticle: ArticleScheme = {
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

    if (saveArticle) {
        // Add new AI news article to AI news article database
        await createPost<ArticleScheme>(newArticle, blogDatabaseConfig);
    }

    return newArticle;
}

export async function generateNewsArticleWithExplanation(writer: Writer, currentNewsItem: NewsItem = { article_id: "", title: "", description: "", pubDate: "", pubDateTZ: "" }, saveArticle: boolean = true): Promise<ArticleScheme | undefined> {
    // First generate the explanation points
    const explanationPoints = await generateNewsExplanation(writer, currentNewsItem);
    if (explanationPoints === undefined) {
        console.error("Failed to generate explanation points");
        return undefined;
    }

    // Then expand them into a full article
    const article = await generateNewsArticleFromExplanation(writer, explanationPoints, currentNewsItem, saveArticle);
    return article;
}
