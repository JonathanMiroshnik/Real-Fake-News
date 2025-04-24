import 'dotenv/config'

import axios from 'axios';

const BASE_URL = 'https://newsdata.io/api/1/news';

export type NewsItem = {
    title: string;
    description: string;
}

export async function fetchNews(): Promise<NewsItem[] | undefined> {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        apikey: process.env.NEWSDATA_API_KEY,
        // country: 'us',       // Optional filter: only US news
        language: 'en',      // Optional: only English news
        category: 'top',     // Optional: top news category
      }
    });

    const articles = response.data.results;

    const retNewsItems: NewsItem[] = [];
    for (const article of articles) {
        // console.log('ID:', article.article_id);
        // console.log('Title:', article.title);
        // console.log('Description:', article.description);
        // console.log('---');

        retNewsItems.push({ title: article.title, description: article.description })
    }

    return retNewsItems;

  } catch (error) {
    console.error('Failed to fetch news:', error);
  }
}

