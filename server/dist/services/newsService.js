"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchNews = fetchNews;
require("dotenv/config");
const axios_1 = __importDefault(require("axios"));
const BASE_URL = 'https://newsdata.io/api/1/news';
async function fetchNews() {
    try {
        const response = await axios_1.default.get(BASE_URL, {
            params: {
                apikey: process.env.NEWSDATA_API_KEY,
                // country: 'us',       // Optional filter: only US news
                language: 'en', // Optional: only English news
                category: 'top', // Optional: top news category
            }
        });
        const articles = response.data.results;
        const retNewsItems = [];
        for (const article of articles) {
            // console.log('ID:', article.article_id);
            // console.log('Title:', article.title);
            // console.log('Description:', article.description);
            // console.log('---');
            retNewsItems.push({ title: article.title, description: article.description });
        }
        return retNewsItems;
    }
    catch (error) {
        console.error('Failed to fetch news:', error);
    }
}
//# sourceMappingURL=newsService.js.map