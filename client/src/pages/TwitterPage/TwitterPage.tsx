import { useState } from 'react';
import { searchTweets, getUserTweets, Tweet, TwitterSearchResponse } from '../../services/twitterService';
import TwitterList from '../../components/TwitterList/TwitterList';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import './TwitterPage.css';

function TwitterPage() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchType, setSearchType] = useState<'search' | 'user'>('search');
  const [maxResults, setMaxResults] = useState<number>(20);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query or username');
      return;
    }

    setLoading(true);
    setError(undefined);
    setTweets([]);

    try {
      let response: TwitterSearchResponse;
      
      if (searchType === 'search') {
        response = await searchTweets(searchQuery, maxResults);
      } else {
        response = await getUserTweets(searchQuery, maxResults);
      }

      if (response.success) {
        setTweets(response.tweets);
        if (response.tweets.length === 0) {
          setError('No tweets found. Try a different search query.');
        }
      } else {
        setError(response.error || 'Failed to fetch tweets');
        setTweets([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setTweets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="twitter-page-container">
      <div className="twitter-page-header">
        <SectionHeader topLine="Twitter" bottomLine="Search" />
      </div>

      <div className="twitter-page-search-section">
        <div className="twitter-search-controls">
          <div className="twitter-search-type-toggle">
            <button
              className={searchType === 'search' ? 'active' : ''}
              onClick={() => setSearchType('search')}
            >
              Search Tweets
            </button>
            <button
              className={searchType === 'user' ? 'active' : ''}
              onClick={() => setSearchType('user')}
            >
              User Tweets
            </button>
          </div>

          <div className="twitter-search-input-group">
            <input
              type="text"
              className="twitter-search-input"
              placeholder={searchType === 'search' ? 'Enter search query (e.g., AI news)' : 'Enter username (e.g., elonmusk)'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <div className="twitter-search-options">
              <label>
                Max Results:
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={maxResults}
                  onChange={(e) => setMaxResults(parseInt(e.target.value) || 20)}
                  className="twitter-max-results-input"
                />
              </label>
            </div>
            <button
              className="twitter-search-button"
              onClick={handleSearch}
              disabled={loading || !searchQuery.trim()}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </div>

      <div className="twitter-page-results">
        <TwitterList tweets={tweets} loading={loading} error={error} />
      </div>
    </div>
  );
}

export default TwitterPage;


