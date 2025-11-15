import { Tweet } from '../../services/twitterService';
import TwitterListItem from '../TwitterListItem/TwitterListItem';
import './TwitterList.css';

interface TwitterListProps {
  tweets: Tweet[];
  loading?: boolean;
  error?: string;
}

function TwitterList({ tweets, loading, error }: TwitterListProps) {
  if (loading) {
    return (
      <div className="twitter-list-container">
        <div className="twitter-list-loading">Loading tweets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="twitter-list-container">
        <div className="twitter-list-error">
          <p>Error loading tweets:</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (tweets.length === 0) {
    return (
      <div className="twitter-list-container">
        <div className="twitter-list-empty">No tweets found. Try a different search query.</div>
      </div>
    );
  }

  return (
    <div className="twitter-list-container">
      <div className="twitter-list">
        {tweets.map((tweet) => (
          <TwitterListItem key={tweet.id} tweet={tweet} />
        ))}
      </div>
    </div>
  );
}

export default TwitterList;


