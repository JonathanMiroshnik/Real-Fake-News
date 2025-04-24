"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogWritingManager = blogWritingManager;
// Responsible for the state machine of the blog writers
const crypto_1 = require("crypto");
const llmController_1 = require("../controllers/llmController");
const blogController_1 = require("../controllers/blogController");
const lowdbOperations_1 = require("../lib/lowdb/lowdbOperations");
const constants_1 = require("../config/constants");
const newsService_1 = require("../services/newsService");
function getRandomWriter() {
    const writerReturn = constants_1.WRITERS[(0, crypto_1.randomInt)(constants_1.WRITERS.length)];
    if (writerReturn === undefined) {
        throw console.error("Random Writer not found");
    }
    return writerReturn;
}
async function writeBlogPost(writer, currentNewsItem = { title: "", description: "" }) {
    const META_PROMPT = `
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
        " \n\n DESCRIPTION: \n" + currentNewsItem.description : "")}

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
    console.log(META_PROMPT);
    console.log("Generating new article");
    const result = await (0, llmController_1.generateTextFromString)(META_PROMPT, 'json_object');
    if (result === undefined || !result?.success) {
        console.log("Meta prompt output invalid!");
        return;
    }
    const parsedData = JSON.parse(result.generatedText);
    const newArticle = {
        key: (0, lowdbOperations_1.getUniqueKey)(),
        content: parsedData.content,
        author: writer.name,
        title: parsedData.title,
        timestamp: (new Date()).toUTCString(),
        category: parsedData.category
    };
    (0, lowdbOperations_1.createPost)(newArticle, constants_1.DB_BLOG_POST_FILE);
}
async function newArticlesNeeded() {
    const result = await (0, blogController_1.getPostsAfterDate)(new Date(Date.now() - blogController_1.TIME_BEFORE));
    return constants_1.MINIMAL_NUM_DAILY_ARTICLES - result.articles.length;
}
async function generateScheduledArticles() {
    let newArticles = await newArticlesNeeded();
    if (newArticles < 0) {
        newArticles = 0;
    }
    const currentNews = await (0, newsService_1.fetchNews)();
    if (currentNews === undefined || !currentNews) {
        return;
    }
    for (let i = 0; i < newArticles; i++) {
        await writeBlogPost(getRandomWriter(), currentNews[(0, crypto_1.randomInt)(currentNews.length)]);
    }
}
function blogWritingManager() {
    const interval = 1000 * 60 * 10; // 10 minutes
    generateScheduledArticles();
    setInterval(generateScheduledArticles, interval);
}
//# sourceMappingURL=blogWriting.js.map