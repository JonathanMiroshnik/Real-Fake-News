/**
 * Fifteen seeded news items, dated inside the last week.
 *
 * These are what `newsdata.io` would hand the writing jobs; the seeder stores
 * them so the admin panel's news list has something to show, and Phase 3 reuses
 * the same array as `NewsSource.fetchLatest()`.
 */
import type { MockNewsItem } from './types.js';

export const MOCK_NEWS_ITEMS: MockNewsItem[] = [
  {
    articleId: 'dev-news-01',
    title: 'Council Approves Roundabout, Then Approves Second Roundabout to Reach It',
    description:
      'Traffic planners say the second roundabout is needed because the first is "theoretically unreachable."',
    hoursAgo: 4,
  },
  {
    articleId: 'dev-news-02',
    title: 'Local Man Wins Award for Not Mentioning His Novel at Dinner',
    description:
      'The award was presented quietly and accepted even more quietly, a first for the organising committee.',
    hoursAgo: 11,
  },
  {
    articleId: 'dev-news-03',
    title: 'Bakery Sells Out of Bread After Announcing It Would Not Sell Out of Bread',
    description: 'The announcement was described by the bakery as "a mistake we intend to repeat."',
    hoursAgo: 18,
  },
  {
    articleId: 'dev-news-04',
    title: 'Museum Closes Early After Visitor Asks a Very Good Question',
    description:
      'Staff say they needed the rest of the afternoon to think about the question, which remains unanswered.',
    hoursAgo: 27,
  },
  {
    articleId: 'dev-news-05',
    title: 'Town Installs Bench, Immediately Becomes Destination',
    description:
      'Tourism officials report a 40 percent rise in visitors who described the bench as "surprisingly comfortable."',
    hoursAgo: 33,
  },
  {
    articleId: 'dev-news-06',
    title: 'Software Update Renames All Files to "Document"',
    description:
      'The vendor describes the change as "a simplification" and has offered customers a free apology.',
    hoursAgo: 41,
  },
  {
    articleId: 'dev-news-07',
    title: 'Chef Wins Award for Menu He Has Not Yet Cooked',
    description:
      'The judges praised the presentation, which consisted of a photograph of an empty plate and a confident nod.',
    hoursAgo: 50,
  },
  {
    articleId: 'dev-news-08',
    title: 'Bird Returns to Same Window Every Morning, Demands Explanation',
    description:
      'The bird has refused to comment, though its posture has been described as "litigious."',
    hoursAgo: 59,
  },
  {
    articleId: 'dev-news-09',
    title: 'Study Finds Small Talk Effective Only at Moderate Distances',
    description:
      'Researchers recommend shouting greetings from across a courtyard and never from inside a lift.',
    hoursAgo: 68,
  },
  {
    articleId: 'dev-news-10',
    title: 'Train Delayed by a Single Leaf, Which Officials Describe as "Determined"',
    description:
      'Passengers were compensated with a bottle of water and a brief account of the leaf.',
    hoursAgo: 77,
  },
  {
    articleId: 'dev-news-11',
    title: 'Bookshop Sells Entire Inventory to a Man Who Said He Would "Read Them All"',
    description:
      'Staff say they feel "a mixture of hope and concern," and have offered to deliver the titles in stages.',
    hoursAgo: 86,
  },
  {
    articleId: 'dev-news-12',
    title: 'Marathon Adds a Category for People Who Want to Watch Instead',
    description:
      'The new event is nine hours long, requires no movement, and was described as "sold out for next year."',
    hoursAgo: 100,
  },
  {
    articleId: 'dev-news-13',
    title: 'Man Completes Online Course, Retains Nothing, Receives Certificate',
    description:
      'The certificate was described by the recipient as "the single most beautiful document I will never look at again."',
    hoursAgo: 112,
  },
  {
    articleId: 'dev-news-14',
    title: 'Village Votes to Keep the Pothole Because "It Has Become Symbolic"',
    description:
      'The pothole, which now has a name and a small plaque, will be officially left alone.',
    hoursAgo: 130,
  },
  {
    articleId: 'dev-news-15',
    title: 'Weather Forecast Promises Sun, Then Rains with Visible Reluctance',
    description:
      'The meteorological office says it stands by the forecast "as an idea, rather than as a claim."',
    hoursAgo: 150,
  },
];
