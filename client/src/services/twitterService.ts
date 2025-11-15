// Get API base URL following the pattern used in other services
let VITE_API_BASE: string = "";
if (import.meta.env.VITE_LOCAL_DEV_MODE === undefined) {
  VITE_API_BASE = "http://localhost:5000";
}
else {
  VITE_API_BASE = import.meta.env.VITE_LOCAL_DEV_MODE === "true" ? 
                "http://localhost:5000" : 
                "https://real.sensorcensor.xyz";
}

export type Tweet = {
  id: string;
  text: string;
  author: string;
  authorHandle: string;
  timestamp: Date | string;
  likes?: number;
  retweets?: number;
  replies?: number;
  url: string;
};

export type TwitterSearchResponse = {
  success: boolean;
  tweets: Tweet[];
  error?: string;
};

/**
 * Search for tweets using the Twitter API
 * @param query Search query string
 * @param maxResults Maximum number of tweets to return (default: 20)
 * @returns Promise with Twitter search response
 */
export async function searchTweets(query: string, maxResults: number = 20): Promise<TwitterSearchResponse> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `${VITE_API_BASE}/api/twitter/search?q=${encodedQuery}&maxResults=${maxResults}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch tweets' }));
      return {
        success: false,
        tweets: [],
        error: errorData.error || `HTTP error! status: ${response.status}`,
      };
    }

    const data: TwitterSearchResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Twitter search error:', error);
    return {
      success: false,
      tweets: [],
      error: error instanceof Error ? error.message : 'Failed to search tweets',
    };
  }
}

/**
 * Get tweets from a specific user
 * @param username Twitter username (without @)
 * @param maxResults Maximum number of tweets to return (default: 20)
 * @returns Promise with Twitter search response
 */
export async function getUserTweets(username: string, maxResults: number = 20): Promise<TwitterSearchResponse> {
  try {
    const cleanUsername = username.replace('@', '');
    const url = `${VITE_API_BASE}/api/twitter/user/${cleanUsername}?maxResults=${maxResults}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch tweets' }));
      return {
        success: false,
        tweets: [],
        error: errorData.error || `HTTP error! status: ${response.status}`,
      };
    }

    const data: TwitterSearchResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Get user tweets error:', error);
    return {
      success: false,
      tweets: [],
      error: error instanceof Error ? error.message : 'Failed to get user tweets',
    };
  }
}


