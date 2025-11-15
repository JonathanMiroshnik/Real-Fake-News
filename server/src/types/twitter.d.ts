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
  maxResults?: number;
  since?: Date;
};

export type TwitterSearchResponse = {
  success: boolean;
  tweets: Tweet[];
  error?: string;
};

