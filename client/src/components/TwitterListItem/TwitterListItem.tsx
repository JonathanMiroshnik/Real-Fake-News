import { Tweet } from '../../services/twitterService';
import { getLatestTime } from '../../services/timeService';
import './TwitterListItem.css';

interface TwitterListItemProps {
  tweet: Tweet;
}

function TwitterListItem({ tweet }: TwitterListItemProps) {
  const formatTimestamp = (timestamp: Date | string): string => {
    if (!timestamp) return '';
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    if (isNaN(date.getTime())) return '';
    return getLatestTime(new Date().getTime() - date.getTime());
  };

  return (
    <div className="twitter-list-item">
      <div className="twitter-list-item-header">
        <div className="twitter-list-item-author">
          <span className="twitter-list-item-author-name">{tweet.author}</span>
          <span className="twitter-list-item-author-handle">@{tweet.authorHandle}</span>
        </div>
        <a 
          href={tweet.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="twitter-list-item-link"
          title="View on Twitter"
        >
          🔗
        </a>
      </div>
      <div className="twitter-list-item-text">
        {tweet.text}
      </div>
      <div className="twitter-list-item-footer">
        <span className="twitter-list-item-timestamp">
          {formatTimestamp(tweet.timestamp)}
        </span>
        {(tweet.likes !== undefined || tweet.retweets !== undefined || tweet.replies !== undefined) && (
          <div className="twitter-list-item-stats">
            {tweet.replies !== undefined && (
              <span className="twitter-stat">💬 {tweet.replies}</span>
            )}
            {tweet.retweets !== undefined && (
              <span className="twitter-stat">🔄 {tweet.retweets}</span>
            )}
            {tweet.likes !== undefined && (
              <span className="twitter-stat">❤️ {tweet.likes}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TwitterListItem;


