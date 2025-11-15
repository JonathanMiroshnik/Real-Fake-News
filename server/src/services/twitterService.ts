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
  // 'https://nitter.it',
  // 'https://nitter.privacyredirect.com',
  // 'https://nitter.pussthecat.org',
  // 'https://nitter.fdn.fr',
  // 'https://nitter.42l.fr',
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
   * Parses tweets from Nitter HTML page
   */
  private parseTweetsFromHTML(html: string, baseUrl: string, maxResults: number = 20): Tweet[] {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Nitter uses different class names, try multiple selectors
    const tweetSelectors = [
      '.timeline-item',
      '.tweet',
      'div[data-id]',
      '.tweet-container',
    ];
    
    let tweetElements: NodeListOf<Element> | null = null;
    for (const selector of tweetSelectors) {
      tweetElements = document.querySelectorAll(selector);
      if (tweetElements.length > 0) {
        break;
      }
    }
    
    const tweets: Tweet[] = [];
    const processedIds = new Set<string>();
    
    let elementsToProcess: Element[] = [];
    
    // If no tweet containers found, try finding tweets by links
    if (!tweetElements || tweetElements.length === 0) {
      console.log('No tweet containers found. Trying alternative method: finding by status links...');
      const allStatusLinks = document.querySelectorAll('a[href*="/status/"]');
      if (allStatusLinks.length === 0) {
        console.log('No status links found in HTML');
        return [];
      }
      
      // Group links by their closest parent container
      const linkContainers = new Set<Element>();
      allStatusLinks.forEach(link => {
        const container = link.closest('div[class*="tweet"], div[class*="timeline"], article, .tweet-container, .timeline-item') || link.parentElement?.parentElement;
        if (container) {
          linkContainers.add(container);
        }
      });
      
      elementsToProcess = Array.from(linkContainers);
      if (elementsToProcess.length === 0) {
        console.log('Could not find tweet containers');
        return [];
      }
    } else {
      // Process each tweet element
      elementsToProcess = Array.from(tweetElements);
    }
    
    for (const tweetEl of elementsToProcess) {
      if (tweets.length >= maxResults) break;
      
      try {
        // Extract tweet link (contains status ID) - try .tweet-link first, then fallback
        let tweetLink = tweetEl.querySelector('.tweet-link') as HTMLAnchorElement;
        if (!tweetLink) {
          tweetLink = tweetEl.querySelector('a[href*="/status/"]') as HTMLAnchorElement;
        }
        if (!tweetLink || !tweetLink.href) continue;
        
        // Extract tweet ID from URL (handle both relative and absolute URLs)
        const href = tweetLink.href;
        const idMatch = href.match(/\/status\/(\d+)/);
        if (!idMatch) continue;
        
        const id = idMatch[1];
        if (processedIds.has(id)) continue; // Skip duplicates
        processedIds.add(id);
        
        // Extract tweet text - Nitter uses .tweet-content.media-body or .tweet-content
        const textEl = tweetEl.querySelector('.tweet-content.media-body, .tweet-content');
        let text = textEl?.textContent?.trim() || '';
        
        // If no text found, try fallback
        if (!text) {
          // Try getting from tweet-body and clean it up
          const bodyEl = tweetEl.querySelector('.tweet-body');
          if (bodyEl) {
            // Clone to avoid modifying original
            const bodyClone = bodyEl.cloneNode(true) as Element;
            // Remove stats and header elements
            bodyClone.querySelectorAll('.tweet-stats, .tweet-header, .retweet-header').forEach(el => el.remove());
            text = bodyClone.textContent?.trim() || '';
          }
        }
        
        // Extract author name - .fullname contains the name
        const fullnameEl = tweetEl.querySelector('.fullname');
        let author = 'Unknown';
        if (fullnameEl) {
          // Get text content but remove verified icon text
          const fullnameText = fullnameEl.textContent?.trim() || '';
          author = fullnameText.split('\n')[0].trim(); // Take first line to avoid icon text
        }
        
        // Extract handle - .username contains @handle
        const usernameEl = tweetEl.querySelector('.username');
        let authorHandle = 'unknown';
        if (usernameEl) {
          const usernameText = usernameEl.textContent?.trim() || '';
          authorHandle = usernameText.replace('@', ''); // Remove @ symbol
        }
        
        // Fallback: extract handle from link if username element not found
        if (authorHandle === 'unknown') {
          const handleLink = tweetEl.querySelector('a.username, a[href^="/"][href*="/"]') as HTMLAnchorElement;
          if (handleLink && handleLink.href) {
            const handleMatch = handleLink.href.match(/\/([^\/]+)$/);
            if (handleMatch) {
              authorHandle = handleMatch[1];
            }
          }
        }
        
        // Extract timestamp - .tweet-date a has title attribute with full date
        let timestamp = new Date();
        const dateLink = tweetEl.querySelector('.tweet-date a');
        if (dateLink) {
          const timeTitle = dateLink.getAttribute('title');
          if (timeTitle) {
            // Parse date from title like "Nov 15, 2025 · 8:30 AM UTC"
            const parsedDate = new Date(timeTitle);
            if (!isNaN(parsedDate.getTime())) {
              timestamp = parsedDate;
            }
          }
        }
        
        // Extract stats from .tweet-stat elements
        let likes: number | undefined;
        let retweets: number | undefined;
        let replies: number | undefined;
        
        const tweetStats = tweetEl.querySelectorAll('.tweet-stat');
        tweetStats.forEach(stat => {
          const statText = stat.textContent?.trim() || '';
          // Remove commas and parse number
          const numberMatch = statText.replace(/,/g, '').match(/(\d+)/);
          if (numberMatch) {
            const count = parseInt(numberMatch[1], 10);
            
            // Determine which stat by icon class
            if (stat.querySelector('.icon-comment, .icon-reply')) {
              replies = count;
            } else if (stat.querySelector('.icon-retweet, .icon-repeat')) {
              retweets = count;
            } else if (stat.querySelector('.icon-heart, .icon-like')) {
              likes = count;
            }
          }
        });
        
        // Construct full Twitter URL
        const statusPath = href.startsWith('http') ? href : href.replace(/^\/+/, '/');
        const url = statusPath.startsWith('http') 
          ? statusPath 
          : `https://twitter.com${statusPath.split('#')[0]}`; // Remove fragment
        
        const tweet: Tweet = {
          id,
          text: text || 'No text available',
          author: author || 'Unknown',
          authorHandle: authorHandle || 'unknown',
          timestamp,
          likes,
          retweets,
          replies,
          url,
        };
        
        tweets.push(tweet);
      } catch (error) {
        console.log(`Error parsing tweet element: ${error instanceof Error ? error.message : String(error)}`);
        continue;
      }
    }
    
    return tweets;
  }

  /**
   * Tries to find a working Nitter instance by testing HTML page
   */
  private async findWorkingInstance(): Promise<string | null> {
    // Test each instance with HTML page
    for (const instance of NITTER_INSTANCES) {
      try {
        // Test the search page HTML
        const testUrl = `${instance}/search`;
        const response = await axios.get(testUrl, {
          params: { q: 'test' },
          timeout: 10000,
          responseType: 'text',
          decompress: true,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': `${instance}/`,
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
          },
          validateStatus: (status) => status === 200 || status === 429,
          maxRedirects: 5,
        });
        
        // Check if response is HTML
        const contentType = response.headers['content-type'] || '';
        const bodyStr = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
        const trimmedBody = bodyStr.trim();
        const isHTML = contentType.includes('html') || trimmedBody.toLowerCase().includes('<!doctype') || trimmedBody.toLowerCase().startsWith('<html');
        
        // 429 (rate limit) might be temporary
        if (response.status === 429) {
          console.log(`Instance ${instance} returned 429 (rate limited), but may work later`);
          continue;
        }
        
        if (response.status === 200 && isHTML) {
          // Check if it looks like a Nitter page (not a bot check page)
          if (trimmedBody.includes('nitter') || trimmedBody.includes('tweet') || trimmedBody.includes('timeline')) {
            console.log(`Found working Nitter instance: ${instance}`);
            return instance;
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.log(`Instance ${instance} test error: ${errorMsg}`);
        continue;
      }
    }
    
    // Return first instance as fallback - might work for actual requests
    console.log('No working Nitter instances found in test. Will try instances during actual requests...');
    return NITTER_INSTANCES[0];
  }

  /**
   * Search for tweets using Nitter HTML page
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

    // Try instances in order until one works
    const instancesToTry = [this.currentNitterInstance, ...NITTER_INSTANCES].filter(Boolean);
    const uniqueInstances = [...new Set(instancesToTry)];

    let lastError: Error | null = null;

    for (const instance of uniqueInstances) {
      try {
        // Nitter search page: /search?q=QUERY&f=tweets
        const searchUrl = `${instance}/search`;
        const fullUrl = `${searchUrl}?q=${encodeURIComponent(options.query)}`; // &f=tweets
        console.log(`Trying to fetch from ${instance}: ${fullUrl}`);
        
        const response = await axios.get(searchUrl, {
          params: {
            q: options.query,
            f: 'tweets',
          },
          timeout: 15000,
          responseType: 'text', // Force text response
          decompress: true, // Let axios handle decompression (gzip, deflate, br)
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            // Don't set Accept-Encoding - let axios handle it automatically (will use gzip, deflate, br)
            'Referer': `${instance}/`,
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'no-cache',
          },
          validateStatus: (status) => {
            // Only accept 200 status codes
            if (status === 200) return true;
            console.log(`Instance ${instance} returned status ${status}`);
            return false;
          },
          maxRedirects: 5,
        });

        // Validate response
        if (response.status !== 200) {
          console.log(`Instance ${instance} returned status ${response.status}, trying next...`);
          lastError = new Error(`Nitter instance returned status ${response.status}`);
          continue;
        }

        let responseData = response.data;
        
        // Convert to string if it's not already (handles Buffer, object, etc.)
        if (typeof responseData !== 'string') {
          if (Buffer.isBuffer(responseData)) {
            responseData = responseData.toString('utf-8');
          } else if (typeof responseData === 'object') {
            console.log(`Instance ${instance} returned object/JSON instead of HTML`);
            lastError = new Error('Nitter instance returned JSON instead of HTML');
            continue;
          } else {
            responseData = String(responseData);
          }
        }
        
        if (!responseData || responseData.length === 0) {
          console.log(`Instance ${instance} returned empty response`);
          lastError = new Error('Empty response from Nitter instance');
          continue;
        }

        // Check if response is HTML
        const trimmedData = responseData.trim();
        if (!trimmedData.toLowerCase().includes('<!doctype') && !trimmedData.toLowerCase().startsWith('<html')) {
          console.log(`Instance ${instance} returned non-HTML content, trying next...`);
          lastError = new Error('Nitter instance returned non-HTML content');
          continue;
        }

        // console.log('responseData', responseData);

        // Success! Parse HTML and extract tweets
        this.currentNitterInstance = instance;
        console.log(`Successfully using Nitter instance: ${instance} for search`);

        const maxResults = options.maxResults || 20;
        let tweets = this.parseTweetsFromHTML(responseData, instance, maxResults * 2); // Get more to filter by date

        // Filter by date if specified
        if (options.since) {
          tweets = tweets.filter(tweet => tweet.timestamp >= options.since!);
        }

        // Limit results
        tweets = tweets.slice(0, maxResults);

        if (tweets.length === 0) {
          console.log(`No tweets found in HTML from ${instance}, trying next instance...`);
          lastError = new Error('No tweets found in response');
          continue;
        }

        return tweets;
      } catch (error) {
        // Try next instance
        lastError = error instanceof Error ? error : new Error(String(error));
        console.log(`Instance ${instance} error: ${lastError.message}`);
        continue;
      }
    }

    // All instances failed
    console.error('Twitter search error: All instances failed');
    throw new Error(`Failed to search tweets: ${lastError ? lastError.message : 'No working Nitter instances available. Consider self-hosting Nitter.'}`);
  }

  /**
   * Get tweets from a specific user using Nitter HTML page
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

    // Try instances in order until one works
    const instancesToTry = [this.currentNitterInstance, ...NITTER_INSTANCES].filter(Boolean);
    const uniqueInstances = [...new Set(instancesToTry)];

    let lastError: Error | null = null;

    for (const instance of uniqueInstances) {
      try {
        // Nitter user page: /USERNAME
        const userUrl = `${instance}/${username}`;
        const response = await axios.get(userUrl, {
          timeout: 15000,
          responseType: 'text', // Force text response
          decompress: true, // Let axios handle decompression (gzip, deflate, br)
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            // Don't set Accept-Encoding - let axios handle it automatically (will use gzip, deflate, br)
            'Referer': `${instance}/`,
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'no-cache',
          },
          validateStatus: (status) => {
            // Only accept 200 status codes
            if (status === 200) return true;
            console.log(`Instance ${instance} returned status ${status} for user ${username}`);
            return false;
          },
          maxRedirects: 5,
        });

        // Validate response
        if (response.status !== 200) {
          console.log(`Instance ${instance} returned status ${response.status} for user ${username}, trying next...`);
          lastError = new Error(`Nitter instance returned status ${response.status}`);
          continue;
        }

        let responseData = response.data;
        
        // Convert to string if it's not already (handles Buffer, object, etc.)
        if (typeof responseData !== 'string') {
          if (Buffer.isBuffer(responseData)) {
            responseData = responseData.toString('utf-8');
          } else if (typeof responseData === 'object') {
            responseData = JSON.stringify(responseData);
            console.log(`Instance ${instance} returned JSON instead of HTML for user ${username}, trying next...`);
            lastError = new Error('Nitter instance returned JSON instead of HTML');
            continue;
          } else {
            responseData = String(responseData);
          }
        }
        
        if (!responseData || responseData.length === 0) {
          console.log(`Instance ${instance} returned empty response for user ${username}, trying next...`);
          lastError = new Error('Empty response from Nitter instance');
          continue;
        }

        // Check if response is HTML
        const trimmedData = responseData.trim();
        if (!trimmedData.toLowerCase().includes('<!doctype') && !trimmedData.toLowerCase().startsWith('<html')) {
          console.log(`Instance ${instance} returned non-HTML content for user ${username}, trying next...`);
          lastError = new Error('Nitter instance returned non-HTML content');
          continue;
        }

        // Success! Parse HTML and extract tweets
        this.currentNitterInstance = instance;
        console.log(`Successfully using Nitter instance: ${instance} for user ${username}`);

        const tweets = this.parseTweetsFromHTML(responseData, instance, maxResults);

        // Set author info from username (since we know it)
        tweets.forEach(tweet => {
          tweet.author = tweet.author === 'Unknown' ? username : tweet.author;
          tweet.authorHandle = username;
        });

        if (tweets.length === 0) {
          console.log(`No tweets found in HTML from ${instance} for user ${username}, trying next instance...`);
          lastError = new Error('No tweets found in response');
          continue;
        }

        return tweets;
      } catch (error) {
        // Try next instance
        lastError = error instanceof Error ? error : new Error(String(error));
        console.log(`Instance ${instance} error for user ${username}: ${lastError.message}`);
        continue;
      }
    }

    // All instances failed
    console.error(`Get user tweets error: All instances failed for user ${username}`);
    throw new Error(`Failed to get user tweets: ${lastError ? lastError.message : 'No working Nitter instances available.'}`);
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

