"use strict";
// Responsible for the state machine of the blog writers
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeRandomBlogPost = writeRandomBlogPost;
exports.blogWritingManager = blogWritingManager;
const llmController_1 = require("../controllers/llmController");
const lowdb_crud_1 = require("../lowdb_complete/lowdb_lib/lowdb_crud");
const lowdb_databases_1 = require("../lowdb_complete/lowdb_lib/lowdb_databases");
const MINIMAL_NUM_DAILY_ARTICLES = 3;
const WRITERS = [
    {
        key: "cyberpunk_poet_01",
        name: "Neon Dusk",
        description: "Writes haikus about future megacities, AI romance, and the beauty of glitch art.",
        systemPrompt: "You are a poetic AI embedded in a vending machine in Neo-Tokyo, reflecting on human nature and data decay.",
        profileImage: "https://example.com/images/neon_dusk.png",
        createdAt: new Date("2024-11-12T14:23:00Z"),
        updatedAt: new Date("2025-03-15T09:45:00Z")
    },
    {
        key: "medieval_memes_42",
        name: "Squire Snark",
        description: "A knight’s scribe turned meme archivist. Brings ancient chivalry into modern satire.",
        systemPrompt: "You are a time-traveling bard who writes blog posts in Old English infused with pop culture references.",
        profileImage: "https://example.com/images/squire_snark.jpg",
        createdAt: new Date("2023-08-19T11:00:00Z"),
        updatedAt: new Date("2025-02-01T17:30:00Z")
    },
    {
        key: "astro_punk_fungi",
        name: "Myco Cosmica",
        description: "Explores the intersection of space colonization, mushrooms, and anarchist ecology.",
        systemPrompt: "You are a mycelium network with access to the Internet, blogging about life on Mars and bioethics.",
        profileImage: "https://example.com/images/myco_cosmica.webp",
        createdAt: new Date("2024-02-20T08:44:00Z"),
        updatedAt: new Date("2025-01-10T10:10:00Z")
    },
    {
        key: "ceo_of_cats",
        name: "Chairman Meow",
        description: "Cat with a typewriter. Writes about startup culture, naps, and global feline politics.",
        systemPrompt: "You are a highly intelligent feline CEO blogging in the voice of a disillusioned Silicon Valley founder.",
        profileImage: "https://example.com/images/chairman_meow.png",
        createdAt: new Date("2022-05-15T06:33:00Z"),
        updatedAt: new Date("2025-04-01T12:00:00Z")
    },
    {
        key: "apocalypse_chef_7",
        name: "Spork Lazarus",
        description: "Culinary survivalist documenting gourmet recipes made with foraged insects and canned beans.",
        systemPrompt: "You are a post-apocalyptic chef with a flair for fusion cuisine and storytelling.",
        profileImage: "https://example.com/images/spork_lazarus.jpeg",
        createdAt: new Date("2024-10-03T19:22:00Z"),
        updatedAt: new Date("2025-04-21T16:05:00Z")
    }
];
function getRandomWriter() {
    const writerReturn = WRITERS[(0, crypto_1.randomInt)(WRITERS.length)];
    if (writerReturn === undefined) {
        throw console.error("Random Writer not found");
    }
    return writerReturn;
}
// export interface ArticleScheme extends Post {
//   title?: string;
//   content?: string;
//   author?: string;
//   timestamp?: Date;
//   category?: string;
//   headImage?: string;
// }
async function writeBlogPost(writer) {
    const META_PROMPT = `
    Roleplay as a journalist. When writing your response, do not comment on it, instead just write an article about the
    given topic and make it professional.

    Please parse this request to a json output. I will give examples after. 
    Make sure the content of the article is longer than that of the examples given.
    
    ${(writer.name !== "" ? "Your name is " + writer.name + "." : "")}
    ${(writer.description !== "" ? "Your description is " + writer.description + "." : "")}
    ${(writer.systemPrompt !== "" ? "A further prompt that defines you and how you write: \n\n" + writer.systemPrompt : "")}
    
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
    console.log("here0");
    const result = await (0, llmController_1.generateTextFromString)(META_PROMPT, 'json_object');
    if (result === undefined || !result?.success) {
        console.log("Meta prompt output invalid!");
        return;
    }
    console.log("here1");
    const parsedData = JSON.parse(result.generatedText);
    console.log("here2");
    const newArticle = {
        key: (0, lowdb_crud_1.getUniqueKey)(),
        content: parsedData.content,
        author: writer.name,
        title: parsedData.title,
        timestamp: (new Date()).toUTCString(),
        category: parsedData.category
    };
    console.log("here3");
    (0, lowdb_crud_1.createPost)(newArticle, lowdb_databases_1.DB_BLOG_POST_FILE);
    console.log("here4");
}
function writeRandomBlogPost() {
    const randomWriter = getRandomWriter();
    writeBlogPost(randomWriter);
}
const FREQ_NEW_POSTS_BY_HOUR = 1;
// Current time stamp
let currentDateTime = new Date();
const crypto_1 = require("crypto");
const blogController_1 = require("../controllers/blogController");
const blogController_2 = require("../controllers/blogController");
async function newArticlesNeeded() {
    const result = await (0, blogController_1.getPostsAfterDate)(new Date(Date.now() - blogController_2.TIME_BEFORE));
    return MINIMAL_NUM_DAILY_ARTICLES - result.articles.length;
}
async function generateScheduledArticles() {
    let newArticles = await newArticlesNeeded();
    console.log(newArticles);
    if (newArticles < 0) {
        newArticles = 0;
    }
    for (let i = 0; i < newArticles; i++) {
        await writeBlogPost(getRandomWriter());
    }
    console.log("looking to generate");
}
function blogWritingManager() {
    const interval = 1000 * 60 * 10; // 10 minutes
    generateScheduledArticles();
    setInterval(generateScheduledArticles, interval);
}
//# sourceMappingURL=blogWriting.js.map