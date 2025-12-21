import 'dotenv/config'
import axios from 'axios';
import { debugLog, debugError } from '../utils/debugLogger.js';

export type RawNewsItem = {
    article_id: string;
    title: string;
    description: string;
    pubDate: string;
    pubDateTZ: string;
    source: string;
    url?: string;
    category?: string;
    parody_potential?: number; // 0-1 scale
    seriousness_level?: number; // 0-1 scale
};

export type NewsSource = 'newsdata' | 'newsapi' | 'guardian';

type SourceConfig = {
    name: string;
    baseUrl: string;
    apiKeyEnv: string;
    params: Record<string, any>;
    transformResponse: (data: any) => RawNewsItem[];
};

/**
 * Configuration for different news sources
 */
const SOURCE_CONFIGS: Record<NewsSource, SourceConfig> = {
    newsdata: {
        name: 'NewsData.io',
        baseUrl: 'https://newsdata.io/api/1/latest',
        apiKeyEnv: 'NEWSDATA_API_KEY',
        params: {
            language: 'en',
            category: 'top'
        },
        transformResponse: (data: any): RawNewsItem[] => {
            if (!data.results) return [];
            return data.results.map((item: any) => ({
                article_id: item.article_id || item.link || `newsdata-${Date.now()}-${Math.random()}`,
                title: item.title || '',
                description: item.description || item.content || '',
                pubDate: item.pubDate || item.publishedAt || '',
                pubDateTZ: item.pubDateTZ || 'UTC',
                source: 'newsdata',
                url: item.link,
                category: item.category
            }));
        }
    },
    newsapi: {
        name: 'NewsAPI.org',
        baseUrl: 'https://newsapi.org/v2/top-headlines',
        apiKeyEnv: 'NEWSAPI_API_KEY',
        params: {
            language: 'en',
            pageSize: 10
        },
        transformResponse: (data: any): RawNewsItem[] => {
            if (!data.articles) return [];
            return data.articles.map((item: any) => ({
                article_id: item.url || `newsapi-${Date.now()}-${Math.random()}`,
                title: item.title || '',
                description: item.description || item.content || '',
                pubDate: item.publishedAt || '',
                pubDateTZ: 'UTC',
                source: 'newsapi',
                url: item.url,
                category: 'general'
            }));
        }
    },
    guardian: {
        name: 'The Guardian',
        baseUrl: 'https://content.guardianapis.com/search',
        apiKeyEnv: 'GUARDIAN_API_KEY',
        params: {
            'show-fields': 'headline,trailText,publication',
            'page-size': 10
        },
        transformResponse: (data: any): RawNewsItem[] => {
            if (!data.response || !data.response.results) return [];
            return data.response.results.map((item: any) => ({
                article_id: item.id || `guardian-${Date.now()}-${Math.random()}`,
                title: item.webTitle || '',
                description: item.fields?.trailText || '',
                pubDate: item.webPublicationDate || '',
                pubDateTZ: 'UTC',
                source: 'guardian',
                url: item.webUrl,
                category: item.sectionName || 'general'
            }));
        }
    }
};

/**
 * Fetch news from a specific source
 */
export async function fetchFromSource(source: NewsSource): Promise<RawNewsItem[]> {
    const config = SOURCE_CONFIGS[source];
    if (!config) {
        debugError(`Unknown news source: ${source}`);
        return [];
    }

    const apiKey = process.env[config.apiKeyEnv];
    if (!apiKey) {
        debugError(`API key not found for ${config.name}. Set ${config.apiKeyEnv} environment variable.`);
        return [];
    }

    try {
        debugLog(`Fetching news from ${config.name}...`);
        
        const response = await axios.get(config.baseUrl, {
            params: {
                ...config.params,
                apiKey: apiKey
            }
        });

        const items = config.transformResponse(response.data);
        debugLog(`Fetched ${items.length} items from ${config.name}`);
        
        // Add parody potential and seriousness level analysis
        return items.map(item => ({
            ...item,
            parody_potential: analyzeParodyPotential(item),
            seriousness_level: analyzeSeriousnessLevel(item)
        }));
    } catch (error) {
        debugError(`Error fetching from ${config.name}:`, error);
        return [];
    }
}

/**
 * Fetch news from all available sources
 */
export async function fetchFromAllSources(): Promise<RawNewsItem[]> {
    const sources: NewsSource[] = ['newsdata']; // Start with newsdata as it's already configured
    
    // Add other sources if API keys are available
    if (process.env.NEWSAPI_API_KEY) {
        sources.push('newsapi');
    }
    if (process.env.GUARDIAN_API_KEY) {
        sources.push('guardian');
    }

    debugLog(`Fetching from ${sources.length} sources: ${sources.join(', ')}`);
    
    const allPromises = sources.map(source => fetchFromSource(source));
    const results = await Promise.allSettled(allPromises);
    
    const allItems: RawNewsItem[] = [];
    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            allItems.push(...result.value);
        } else {
            debugError(`Failed to fetch from ${sources[index]}:`, result.reason);
        }
    });
    
    debugLog(`Total items fetched from all sources: ${allItems.length}`);
    return allItems;
}

/**
 * Analyze parody potential of a news item (simplified version)
 * In Phase 2+, this could use LLM analysis
 */
function analyzeParodyPotential(item: RawNewsItem): number {
    // Simple heuristic-based analysis
    let score = 0.5; // Base score
    
    // Title length - medium length titles are better for parody
    const titleLength = item.title.length;
    if (titleLength > 30 && titleLength < 100) score += 0.1;
    
    // Description presence
    if (item.description && item.description.length > 50) score += 0.1;
    
    // Certain keywords indicate parody potential
    const parodyKeywords = ['AI', 'robot', 'space', 'Mars', 'technology', 'innovation', 'unusual', 'strange', 'bizarre'];
    const titleLower = item.title.toLowerCase();
    if (parodyKeywords.some(keyword => titleLower.includes(keyword.toLowerCase()))) {
        score += 0.2;
    }
    
    // Certain categories are better for parody
    const goodCategories = ['technology', 'science', 'entertainment', 'weird'];
    if (item.category && goodCategories.includes(item.category.toLowerCase())) {
        score += 0.1;
    }
    
    return Math.min(Math.max(score, 0), 1); // Clamp between 0 and 1
}

/**
 * Analyze seriousness level of a news item
 */
function analyzeSeriousnessLevel(item: RawNewsItem): number {
    // Simple heuristic-based analysis
    let score = 0.5; // Base score
    
    // Serious keywords
    const seriousKeywords = ['war', 'crisis', 'death', 'attack', 'disaster', 'emergency', 'tragedy'];
    const titleLower = item.title.toLowerCase();
    if (seriousKeywords.some(keyword => titleLower.includes(keyword))) {
        score += 0.3;
    }
    
    // Certain categories are more serious
    const seriousCategories = ['politics', 'war', 'crime', 'disaster'];
    if (item.category && seriousCategories.includes(item.category.toLowerCase())) {
        score += 0.2;
    }
    
    return Math.min(Math.max(score, 0), 1); // Clamp between 0 and 1
}

/**
 * Filter and prioritize news items based on parody potential
 */
export function prioritizeNewsItems(items: RawNewsItem[], minParodyPotential: number = 0.3): RawNewsItem[] {
    return items
        .filter(item => item.parody_potential && item.parody_potential >= minParodyPotential)
        .sort((a, b) => (b.parody_potential || 0) - (a.parody_potential || 0));
}

/**
 * Get news items suitable for parody generation
 */
export async function getParodySuitableNews(minParodyPotential: number = 0.3, limit: number = 20): Promise<RawNewsItem[]> {
    const allItems = await fetchFromAllSources();
    const suitableItems = prioritizeNewsItems(allItems, minParodyPotential);
    return suitableItems.slice(0, limit);
}
