/**
 * Writers, blog posts and news items.
 *
 * Images are ensured even for skipped rows: if `IMAGES_PATH` was wiped but the
 * database survived, a second run repairs the files instead of leaving the client
 * with broken `<img>` tags.
 */
import {
  blogDatabaseConfig,
  newsDatabaseConfig,
  writerDatabaseConfig,
} from '../../lib/database/databaseConfigurations.js';
import type { NewsItem } from '../../services/newsService.js';
import type { ArticleScheme } from '../../types/article.js';
import type { Writer } from '../../types/writer.js';
import {
  MOCK_ARTICLES,
  MOCK_NEWS_ITEMS,
  MOCK_WRITERS,
  type MockArticle,
  type MockNewsItem,
  type MockWriter,
} from '../../services/contentSources/mocks/mockContent.js';
import { hoursAgoToIso, type SeedContext } from './seedContext.js';
import { deleteSeedImage, ensureSeedImage } from './seedImages.js';
import { deleteMockRows, insertSeedRow } from './seedRows.js';
import { MOCK_CONTENT_SOURCE } from '../../types/contentSource.js';

/** Builds the `writers` row for one mock profile. Exported for the marking test. */
export function buildWriterRow(mockWriter: MockWriter, context: SeedContext): Writer {
  const timestamp = hoursAgoToIso(context, 0);

  return {
    key: mockWriter.key,
    name: mockWriter.name,
    description: mockWriter.description,
    systemPrompt: mockWriter.systemPrompt,
    profileImage: `${mockWriter.key}.png`,
    createdAt: timestamp,
    updatedAt: timestamp,
    contentSource: MOCK_CONTENT_SOURCE,
  };
}

/** Builds the `blog_posts` row, embedding the author as the client expects. */
export function buildArticleRow(
  mockArticle: MockArticle,
  author: Writer,
  context: SeedContext,
): ArticleScheme {
  const timestamp = hoursAgoToIso(context, mockArticle.hoursAgo);

  return {
    key: mockArticle.key,
    title: mockArticle.title,
    content: mockArticle.paragraphs.join('\n\n'),
    author,
    timestamp,
    category: mockArticle.category,
    headImage: `${mockArticle.key}.png`,
    shortDescription: mockArticle.shortDescription,
    originalNewsItem: {
      article_id: mockArticle.key,
      title: mockArticle.title,
      description: mockArticle.shortDescription,
      pubDate: timestamp,
      pubDateTZ: 'UTC',
    },
    writerType: mockArticle.writerType,
    isFeatured: false,
    featuredDate: undefined,
    contentSource: MOCK_CONTENT_SOURCE,
  };
}

/** Builds the `news_items` row. */
export function buildNewsItemRow(mockNewsItem: MockNewsItem, context: SeedContext): NewsItem {
  return {
    article_id: mockNewsItem.articleId,
    title: mockNewsItem.title,
    description: mockNewsItem.description,
    pubDate: hoursAgoToIso(context, mockNewsItem.hoursAgo),
    pubDateTZ: 'UTC',
    contentSource: MOCK_CONTENT_SOURCE,
  };
}

/** Fails loudly if a mock article points at a writer that does not exist. */
function resolveAuthor(authorsByKey: Map<string, Writer>, authorKey: string): Writer {
  const author = authorsByKey.get(authorKey);

  if (!author) {
    throw new Error(`Mock article references unknown writer "${authorKey}"`);
  }

  return author;
}

/**
 * Inserts the writer profiles.
 *
 * @returns the writer rows keyed by mock key, so articles can embed a full author.
 */
export async function seedWriters(context: SeedContext): Promise<Map<string, Writer>> {
  const authorsByKey = new Map<string, Writer>();

  for (const mockWriter of MOCK_WRITERS) {
    const writerRow = buildWriterRow(mockWriter, context);
    authorsByKey.set(mockWriter.key, writerRow);

    const didCreateImage = await ensureSeedImage(mockWriter.key, context.random);
    if (didCreateImage) context.report.imagesCreated++;

    const wasInserted = await insertSeedRow(writerRow, writerDatabaseConfig, context);
    if (wasInserted) context.report.writersInserted++;
  }

  return authorsByKey;
}

/** Inserts the blog posts, ensuring one placeholder image per post. */
export async function seedArticles(
  context: SeedContext,
  authorsByKey: Map<string, Writer>,
): Promise<void> {
  for (const mockArticle of MOCK_ARTICLES) {
    const didCreateImage = await ensureSeedImage(mockArticle.key, context.random);
    if (didCreateImage) context.report.imagesCreated++;

    const author = resolveAuthor(authorsByKey, mockArticle.authorKey);
    const articleRow = buildArticleRow(mockArticle, author, context);

    const wasInserted = await insertSeedRow(articleRow, blogDatabaseConfig, context);
    if (wasInserted) context.report.articlesInserted++;
  }
}

/** Inserts the raw news items the writing jobs would otherwise fetch. */
export async function seedNewsItems(context: SeedContext): Promise<void> {
  for (const mockNewsItem of MOCK_NEWS_ITEMS) {
    const newsRow = buildNewsItemRow(mockNewsItem, context);
    const wasInserted = await insertSeedRow(newsRow, newsDatabaseConfig, context);
    if (wasInserted) context.report.newsItemsInserted++;
  }
}

/**
 * Removes seeded blog content and its images (`--reset`).
 *
 * Rows are deleted by their `contentSource` marker, so a mock row written by a
 * mock content source (Phase 3) is collected too, not just the ones whose keys are
 * spelled out below. Images are still derived from the known mock keys: a file
 * name cannot be read off a deleted row.
 *
 * News items go first, then articles, then writers: articles embed a full author
 * object, so the writers must outlive them.
 */
export async function resetSeededBlogContent(context: SeedContext): Promise<void> {
  await deleteMockRows(newsDatabaseConfig, context);
  await deleteMockRows(blogDatabaseConfig, context);
  await deleteMockRows(writerDatabaseConfig, context);

  const imageKeys = [
    ...MOCK_ARTICLES.map((article) => article.key),
    ...MOCK_WRITERS.map((writer) => writer.key),
  ];
  for (const imageKey of imageKeys) {
    context.report.removed += deleteSeedImage(imageKey);
  }
}
