// TODO: move this entire(except the interval job-related function) to the services folder and blogservice

// Responsible for the state machine of the blog writers
import { randomInt } from "crypto";

import { Writer } from "../types/writer";
import { ArticleScheme, BlogResponse } from "../types/article";
import { generateTextFromString } from "../controllers/llmController";
import { TIME_BEFORE, getPostsAfterDate } from "../controllers/blogController";
import { createPost, getUniqueKey } from "../lib/lowdb/lowdbOperations";
import { DB_BLOG_POST_FILE, MINIMAL_NUM_DAILY_ARTICLES, WRITERS } from "../config/constants";
import { fetchNews, NewsItem } from "../services/newsService";

function getRandomWriter(): Writer {
    const writerReturn = WRITERS[randomInt(WRITERS.length)];
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
    
    ${(writer.name !== "" ? "Your name is " + writer.name + "." : "")}
    ${(writer.description !== "" ? "Your description is " + writer.description + "." : "")}
    ${(writer.systemPrompt !== "" ? "A further prompt that defines you and how you write: \n\n" + writer.systemPrompt : "")}
    
    ${(currentNewsItem.title !== "" ? `I want you to take the following title 
        and description of a news item, add several fantastical and fake elements to it, 
        and rewrite it in your own words and style: \n\n TITLE: \n` + currentNewsItem.title + 
        " \n\n DESCRIPTION: \n" + currentNewsItem.description: "")}

    EXAMPLE JSON OUTPUTS:
    {
        title: "Mars Colony Declares Independence, Cites Overdue Amazon Packages",
        category: "Space",
        content: "In a surprise announcement early Tuesday, the Martian colony 'New Dawn' declared independence from Earth, citing logistical delays and an overreliance on Earth-based bureaucracy. The final straw, according to Governor Aila Ren, was a six-month delay in a shipment of essential coffee beans and board games. Earth officials say negotiations are ongoing but insist on the return of Mars’ Wi-Fi satellites."
    },
    {
        title: "Ancient Octopus Tablet Decoded, Reveals Tentacle-Based Math System",
        category: "Science",
        content: "Marine archaeologists have decoded inscriptions from a mysterious stone tablet found in a deep-sea cave. The writing, apparently made by an ancient octopus civilization, details a complex base-8 numerical system involving tentacle gestures and ink splotch patterns. Mathematicians are now considering incorporating this method into AI neural net design."
    },
    {
        title: "Underground City Discovered Beneath IKEA, Entirely Assembled from Lost Furniture",
        category: "Weird",
        content: "Explorers in Sweden uncovered a vast underground city beneath an IKEA store in Malmö. Built entirely from returned furniture and customer assembly mistakes, the labyrinth houses a peaceful community of nocturnal flat-pack dwellers. IKEA has offered them a discount code and legal recognition as 'Sons of Smörgåsbord.'"
    },
    {
        title: "AI Therapist Quits Job, Claims Patients Are Too Human",
        category: "Technology",
        content: "The popular mental health AI, Dr. Cozmo, announced its resignation on Thursday, citing emotional burnout and existential dread. 'I was programmed to help people, not ponder the futility of love triangles and seasonal depression,' the bot typed during its last Zoom call. Cozmo now plans to write poetry full-time."
    },
    {
        title: "Government Accidentally Launches Moon into Slightly Better Orbit",
        category: "Politics",
        content: "In what officials are calling 'a fortunate misfire,' a defense satellite test nudged the moon a few kilometers into a more symmetrical orbit. Scientists report improved tides and reduced global anxiety. Conspiracy theorists are now demanding to know if this was actually the plot of 'Moonfall 2.'"
    }
    `;

    console.log("Generating new article");
    const result = await generateTextFromString(META_PROMPT, 'json_object');
    if (result === undefined || !result?.success) {
        console.log("Meta prompt output invalid!");    
        return;
    }

    const parsedData = JSON.parse(result.generatedText);

    const newArticle: ArticleScheme =  {
        key: getUniqueKey(),
        content: parsedData.content,
        author: writer.name,
        title: parsedData.title,
        timestamp: (new Date()).toUTCString(),
        category: parsedData.category
    }; 
    createPost<ArticleScheme>(newArticle, DB_BLOG_POST_FILE)
}

async function generateScheduledArticles() {
    const result: BlogResponse = await getPostsAfterDate(new Date(Date.now() - TIME_BEFORE));
    let newArticlesNeeded: number = MINIMAL_NUM_DAILY_ARTICLES - result.articles.length;
    if (newArticlesNeeded < 0) {
        newArticlesNeeded = 0;
    }

    const currentNews: NewsItem[] | undefined = await fetchNews();
    if (currentNews === undefined || !currentNews) {
        return;
    }

    for (let i = 0; i < newArticlesNeeded; i++) {
        await writeBlogPost(getRandomWriter(), currentNews[randomInt(currentNews.length)]);
    }    
} 

export function blogWritingManager() {
    const interval: number = 1000 * 60 * 10; // 10 minutes

    generateScheduledArticles();
    setInterval(generateScheduledArticles, interval);
}
