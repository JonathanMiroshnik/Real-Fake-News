import 'dotenv/config';
import axios from 'axios';
import { JSDOM } from 'jsdom';

// TODO: add other such service activated flags in the other services!
const SERVICE_ACTIVATED: boolean = true;

// Nitter instances (public instances - may go down, consider self-hosting)
// You can find more at: https://github.com/zedeus/nitter/wiki/Instances
// Note: Many public Nitter instances are currently down or rate-limited
const NITTER_INSTANCES = [
  'https://nitter.net',
  'https://nitter.it',
  'https://nitter.privacyredirect.com',
  'https://nitter.pussthecat.org',
  'https://nitter.fdn.fr',
  'https://nitter.42l.fr',
];

// Rate limiting: Nitter instances are often rate-limited
const MAX_REQUESTS_PER_HOUR = 10; // Conservative limit

export type Tweet = {
  id: string;
  text: string;
  author: string;
  authorHandle: string;
  timestamp: Date;
  likes?: number;
  retweets?: number;
  replies?: number;
  url: string;
};

export type TwitterSearchOptions = {
  query: string;
  maxResults?: number; // Max tweets to return
  since?: Date; // Only return tweets after this date
};

export class TwitterService {
  private currentNitterInstance: string;
  private requestCount: number = 0;
  private lastResetTime: number = Date.now();

  constructor() {
    // Rotate through Nitter instances
    this.currentNitterInstance = NITTER_INSTANCES[0];
  }

  /**
   * Resets rate limit counter if an hour has passed
   */
  private checkRateLimit(): boolean {
    const now = Date.now();
    if (now - this.lastResetTime > 3600000) { // 1 hour
      this.requestCount = 0;
      this.lastResetTime = now;
    }

    if (this.requestCount >= MAX_REQUESTS_PER_HOUR) {
      return false;
    }

    this.requestCount++;
    return true;
  }

  /**
   * Tries to find a working Nitter instance by testing RSS endpoint
   */
  private async findWorkingInstance(): Promise<string | null> {
    // Test each instance with a simple search query
    for (const instance of NITTER_INSTANCES) {
      try {
        const testUrl = `${instance}/search/rss`;
        const response = await axios.get(testUrl, {
          params: {
            f: 'tweets',
            q: 'test',
          },
          timeout: 5000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          validateStatus: (status) => status < 500, // Accept 2xx, 3xx, 4xx
        });
        
        // Check if response looks like RSS/XML
        const contentType = response.headers['content-type'] || '';
        const isXML = contentType.includes('xml') || contentType.includes('rss') || contentType.includes('application/rss');
        const bodyStr = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
        const looksLikeRSS = bodyStr.trim().startsWith('<?xml') || bodyStr.includes('<rss') || bodyStr.includes('<feed');
        
        if (response.status === 200 && (isXML || looksLikeRSS)) {
          return instance;
        }
      } catch (error) {
        continue; // Try next instance
      }
    }
    return null;
  }

  /**
   * Search for tweets using Nitter RSS feed
   * @param options Search options
   * @returns Array of tweets
   */
  public async searchTweets(options: TwitterSearchOptions): Promise<Tweet[]> {
    if (!SERVICE_ACTIVATED) {
      return [];
    }

    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded. Please wait before making more requests.');
    }

    // Find working instance
    const instance = await this.findWorkingInstance();
    if (!instance) {
      throw new Error('No working Nitter instances available. Consider self-hosting Nitter.');
    }

    this.currentNitterInstance = instance;

    try {
      // Nitter RSS feed format: /search/rss?f=tweets&q=QUERY
      const searchUrl = `${this.currentNitterInstance}/search/rss`;
      const response = await axios.get(searchUrl, {
        params: {
          f: 'tweets',
          q: options.query,
        },
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        },
        validateStatus: (status) => status < 500, // Accept 2xx, 3xx, 4xx
      });

      // Validate response
      if (response.status !== 200) {
        throw new Error(`Nitter instance returned status ${response.status}`);
      }

      const responseData = response.data;
      if (!responseData || typeof responseData !== 'string') {
        throw new Error('Invalid response format from Nitter instance');
      }

      // Check if response is XML/RSS
      const trimmedData = responseData.trim();
      if (!trimmedData.startsWith('<?xml') && !trimmedData.startsWith('<rss') && !trimmedData.startsWith('<feed')) {
        console.error('Response is not valid XML/RSS. First 200 chars:', trimmedData.substring(0, 200));
        throw new Error('Nitter instance returned non-XML content (may be blocked or unavailable)');
      }

      // Parse RSS XML
      let dom;
      try {
        dom = new JSDOM(responseData, { 
          contentType: 'text/xml',
          url: searchUrl,
        });
      } catch (parseError) {
        console.error('JSDOM parse error. Response preview:', trimmedData.substring(0, 500));
        throw new Error(`Failed to parse RSS XML: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
      }

      const items = dom.window.document.querySelectorAll('item');

      const tweets: Tweet[] = [];
      const maxResults = options.maxResults || 20;

      for (let i = 0; i < Math.min(items.length, maxResults); i++) {
        const item = items[i];
        const title = item.querySelector('title')?.textContent || '';
        const description = item.querySelector('description')?.textContent || '';
        const link = item.querySelector('link')?.textContent || '';
        const pubDate = item.querySelector('pubDate')?.textContent || '';

        // Extract author from title (format: "Author Name on Twitter: Tweet text")
        const authorMatch = title.match(/^(.+?)\s+on\s+Twitter:/);
        const author = authorMatch ? authorMatch[1] : 'Unknown';
        
        // Extract handle from link
        const handleMatch = link.match(/twitter\.com\/([^\/]+)/);
        const authorHandle = handleMatch ? handleMatch[1] : 'unknown';

        // Extract tweet ID from link
        const idMatch = link.match(/status\/(\d+)/);
        const id = idMatch ? idMatch[1] : Date.now().toString();

        const tweet: Tweet = {
          id,
          text: description || title.replace(/^.+?on\s+Twitter:\s*/, ''),
          author,
          authorHandle,
          timestamp: new Date(pubDate),
          url: link,
        };

        // Filter by date if specified
        if (options.since && tweet.timestamp < options.since) {
          continue;
        }

        tweets.push(tweet);
      }

      return tweets;
    } catch (error) {
      console.error('Twitter search error:', error);
      throw new Error(`Failed to search tweets: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get tweets from a specific user
   * @param username Twitter username (without @)
   * @param maxResults Maximum number of tweets to return
   * @returns Array of tweets
   */
  public async getUserTweets(username: string, maxResults: number = 20): Promise<Tweet[]> {
    if (!SERVICE_ACTIVATED) {
      return [];
    }

    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded. Please wait before making more requests.');
    }

    const instance = await this.findWorkingInstance();
    if (!instance) {
      throw new Error('No working Nitter instances available.');
    }

    try {
      // Nitter user RSS feed format: /USERNAME/rss
      const rssUrl = `${instance}/${username}/rss`;
      const response = await axios.get(rssUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        },
        validateStatus: (status) => status < 500,
      });

      // Validate response
      if (response.status !== 200) {
        throw new Error(`Nitter instance returned status ${response.status}`);
      }

      const responseData = response.data;
      if (!responseData || typeof responseData !== 'string') {
        throw new Error('Invalid response format from Nitter instance');
      }

      // Check if response is XML/RSS
      const trimmedData = responseData.trim();
      if (!trimmedData.startsWith('<?xml') && !trimmedData.startsWith('<rss') && !trimmedData.startsWith('<feed')) {
        console.error('Response is not valid XML/RSS. First 200 chars:', trimmedData.substring(0, 200));
        throw new Error('Nitter instance returned non-XML content (may be blocked or unavailable)');
      }

      // Parse RSS XML
      let dom;
      try {
        dom = new JSDOM(responseData, { 
          contentType: 'text/xml',
          url: rssUrl,
        });
      } catch (parseError) {
        console.error('JSDOM parse error. Response preview:', trimmedData.substring(0, 500));
        throw new Error(`Failed to parse RSS XML: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
      }

      const items = dom.window.document.querySelectorAll('item');

      const tweets: Tweet[] = [];

      for (let i = 0; i < Math.min(items.length, maxResults); i++) {
        const item = items[i];
        const title = item.querySelector('title')?.textContent || '';
        const description = item.querySelector('description')?.textContent || '';
        const link = item.querySelector('link')?.textContent || '';
        const pubDate = item.querySelector('pubDate')?.textContent || '';

        const idMatch = link.match(/status\/(\d+)/);
        const id = idMatch ? idMatch[1] : Date.now().toString();

        tweets.push({
          id,
          text: description || title,
          author: username,
          authorHandle: username,
          timestamp: new Date(pubDate),
          url: link,
        });
      }

      return tweets;
    } catch (error) {
      console.error('Get user tweets error:', error);
      throw new Error(`Failed to get user tweets: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Convenience function
export async function searchTweets(query: string, maxResults?: number): Promise<Tweet[]> {
  try {
    const twitterService = new TwitterService();
    return await twitterService.searchTweets({ query, maxResults });
  } catch (error) {
    console.error('Twitter search error:', error);
    throw error;
  }
}

// Convenience function
export async function getUserTweets(username: string, maxResults?: number): Promise<Tweet[]> {
  try {
    const twitterService = new TwitterService();
    return await twitterService.getUserTweets(username, maxResults);
  } catch (error) {
    console.error('Get user tweets error:', error);
    throw error;
  }
}

