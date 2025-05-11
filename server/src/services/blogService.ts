import 'dotenv/config'

import { getAllPosts } from '../lib/lowdb/lowdbOperations.js';
import { DB_BLOG_POST_FILE } from '../config/constants.js';
import { ArticleScheme, BlogResponse } from '../types/article.js';

export async function getAllPostsAfterDate(startDate: Date): Promise<BlogResponse> {
    const allArticles: ArticleScheme[] = await getAllPosts<ArticleScheme>(DB_BLOG_POST_FILE);

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
