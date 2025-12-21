import { NEWS_API_NUM_OF_ARTICLES_PER_TOKEN } from "../config/constants.js";
import { createPost } from "../lib/database/sqliteOperations.js";
import { newsDatabaseConfig } from "../lib/database/databaseConfigurations.js";
import { NewsItem, remainingTokens, fetchNews } from "../services/newsService.js";
import { debugLog, debugError } from "../utils/debugLogger.js";

// TODO: I want to get an arbitrary number of daily articles to use in any given moment.
export async function addNewsToTotal(numArticles: number = 10): Promise<NewsItem[]> {
  debugLog('📰 [addNewsToTotal] Starting news fetch for', numArticles, 'articles');
  debugLog('📰 [addNewsToTotal] Remaining tokens:', remainingTokens);
  
  // TODO: perhaps I could just check the number of tokens left by asking the API at some other URL?
  // If there are no more tokens remaining, this function cannot be used.
  if (remainingTokens <= 0) {
    debugError('❌ [addNewsToTotal] No more tokens remaining');
    throw new Error("No more tokens remaining.");
  }
  
  if (remainingTokens * NEWS_API_NUM_OF_ARTICLES_PER_TOKEN < numArticles) {
    debugError('❌ [addNewsToTotal] Not enough tokens remaining for', numArticles, 'articles');
    throw new Error(`Not enough tokens remaining for ${numArticles} articles.`);
  }

  let neededApiRequests = Math.ceil(numArticles / NEWS_API_NUM_OF_ARTICLES_PER_TOKEN);
  let nextPage: string = "";
  debugLog('📰 [addNewsToTotal] Needed API requests:', neededApiRequests);

  let retArticles: NewsItem[] = [];
  let gatherPage: string;
  
  for (let i = 0; i < neededApiRequests; i++) {
    debugLog('📰 [addNewsToTotal] Making API request', i + 1, 'of', neededApiRequests);
    [retArticles, gatherPage] = await fetchNews(nextPage);
    
    debugLog('📰 [addNewsToTotal] Fetched', retArticles.length, 'recent real news articles');
    
    if (retArticles.length === 0) {
      debugLog('⚠️ [addNewsToTotal] No articles returned from fetchNews');
    } else {
      debugLog('📰 [addNewsToTotal] First article title:', retArticles[0]?.title);
    }

    const insertedArticles = await insertArticlesToDatabase(retArticles);
    debugLog('📰 [addNewsToTotal] Inserted', insertedArticles.length, 'articles to database');
    
    nextPage = gatherPage;
    if (nextPage === "") {
      debugLog('📰 [addNewsToTotal] No next page available, stopping');
      break;
    }
  }
  
  debugLog('✅ [addNewsToTotal] Completed, total fetched articles:', retArticles.length);
  return retArticles;
}

async function insertArticlesToDatabase(articles: any[]): Promise<NewsItem[]> {
    var retArticles: NewsItem[] = [];

    for (const article of articles) {
        // TODO: add topics filter list in .env or outside in general
        const questionPrompt = `
        Is the following article title and/or description related to the following topics?\n
        Topics: Israel, Gaza, IDF\n
        Article Title: ${article.title}\n
        Article Description: ${article.description}\n
        `;

        // TODO: perhaps 10 articles at once and remove the ones that dont work out and basically return a 10 long json boolean check? 
        // const boolResponse: boolean = await getBooleanResponse(questionPrompt);
        // console.log("Is this related?", boolResponse);
        // if (!boolResponse) {
        
        if (await createPost<NewsItem>(article, newsDatabaseConfig)) {
          retArticles.push({ 
              article_id: article.article_id, 
              title: article.title, 
              description: article.description, 
              pubDate: article.pubDate, 
              pubDateTZ: article.pubDateTZ
          });
        }
    }    
    
    return retArticles;
}
