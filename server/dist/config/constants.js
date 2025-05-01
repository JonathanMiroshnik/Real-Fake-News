"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WRITERS = exports.MINIMAL_NUM_DAILY_ARTICLES = exports.DB_WRITERS_FILE = exports.DB_USERS_FILE = exports.DB_BLOG_POST_FILE = exports.VALID_CATEGORIES = void 0;
// LowDB database locations
const DB_BLOG_POST_FILE = "data/blogPosts.json";
exports.DB_BLOG_POST_FILE = DB_BLOG_POST_FILE;
const DB_USERS_FILE = "data/users.json";
exports.DB_USERS_FILE = DB_USERS_FILE;
const DB_WRITERS_FILE = "data/writers.json";
exports.DB_WRITERS_FILE = DB_WRITERS_FILE;
const MINIMAL_NUM_DAILY_ARTICLES = 4;
exports.MINIMAL_NUM_DAILY_ARTICLES = MINIMAL_NUM_DAILY_ARTICLES;
exports.VALID_CATEGORIES = ["Politics", "Sports", "Culture", "Economics", "Technology", "Food"];
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
exports.WRITERS = WRITERS;
//# sourceMappingURL=constants.js.map