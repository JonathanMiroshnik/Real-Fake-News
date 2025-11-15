import { Request, Response } from 'express';
import { TwitterService, searchTweets, getUserTweets } from '../services/twitterService.js';
import { TwitterSearchResponse } from '../types/twitter.js';

export const searchTwitter = async (req: Request, res: Response) => {
  console.log('Searching Twitter!');

  try {
    const query = req.query.q as string;
    const maxResults = req.query.maxResults 
      ? parseInt(req.query.maxResults as string, 10) 
      : undefined;

    if (!query) {
      res.status(400).json({ 
        success: false, 
        tweets: [], 
        error: 'Query parameter "q" is required' 
      });
      return;
    }

    const tweets = await searchTweets(query, maxResults);
    const response: TwitterSearchResponse = {
      success: true,
      tweets,
    };

    res.json(response);
  } catch (error) {
    console.error('Twitter search error:', error);
    const response: TwitterSearchResponse = {
      success: false,
      tweets: [],
      error: error instanceof Error ? error.message : 'Failed to search tweets',
    };
    res.status(500).json(response);
  }
};

export const getUserTwitterTweets = async (req: Request, res: Response) => {
  console.log('Getting user Twitter tweets!');

  try {
    const username = req.params.username;
    const maxResults = req.query.maxResults 
      ? parseInt(req.query.maxResults as string, 10) 
      : undefined;

    if (!username) {
      res.status(400).json({ 
        success: false, 
        tweets: [], 
        error: 'Username parameter is required' 
      });
      return;
    }

    // Remove @ if present
    const cleanUsername = username.replace('@', '');

    const tweets = await getUserTweets(cleanUsername, maxResults);
    const response: TwitterSearchResponse = {
      success: true,
      tweets,
    };

    res.json(response);
  } catch (error) {
    console.error('Get user tweets error:', error);
    const response: TwitterSearchResponse = {
      success: false,
      tweets: [],
      error: error instanceof Error ? error.message : 'Failed to get user tweets',
    };
    res.status(500).json(response);
  }
};

