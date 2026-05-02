import 'dotenv/config';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { Jimp, rgbaToInt } from 'jimp';
import { getUniqueKey } from '../utils/general.js';
import { debugLog } from '../utils/debugLogger.js';
import { ArticleScheme, RecipeScheme, BlogResponse } from '../types/article.js';
import { Writer } from '../types/writer.js';
import { Horoscope, ZODIAC_SIGNS } from '../types/horoscope.js';
import { getImagesDirectory } from '../utils/imageCompression.js';

/**
 * Whether fake data fallback is enabled.
 * Controlled via the ENABLE_FAKE_DATA environment variable.
 */
export function isFakeDataEnabled(): boolean {
  return process.env.ENABLE_FAKE_DATA === 'true';
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const FAKE_CATEGORIES = [
  'Technology',
  'Travel',
  'Food',
  'Science',
  'Health',
  'Business',
  'Entertainment',
  'Sports',
];
const FAKE_WRITER_NAMES = [
  'Alex Johnson',
  'Sam Smith',
  'Taylor Reed',
  'Jordan Lee',
  'Casey Kim',
  'Morgan Wells',
];
const FAKE_WRITER_DESCRIPTIONS = [
  'Award-winning journalist with 10+ years of experience',
  'Tech enthusiast and startup advisor',
  'Travel blogger exploring hidden gems worldwide',
  'Food critic and culinary expert',
  'Science communicator making complex topics accessible',
  'Business analyst and market trends expert',
];

const FAKE_HEADLINES = [
  'Local Man Shocked to Learn His Pet Rock Has No Opinions on Politics',
  'Scientists Discover That Coffee Actually Makes You More Human',
  'New Study Finds 9 Out of 10 Statistics Are Made Up on the Spot',
  'Government Declares Monday Officially the Worst Day of the Week, Again',
  'Expert Reveals the Secret to Happiness Is Just Pretending to Be Happy',
  'Breaking: Internet Crashes After Everyone Tries to Watch the Same Cat Video',
  'The Moon Announces Plans to Pursue a Career in Professional Wrestling',
  'Survey Finds 100% of People Surveyed Were Made Up for This Survey',
  'Man Who Always Says "I Could Do That" Finally Challenged, Flees Country',
  'Scientists Baffled by Discovery That Clouds Are Made of Tiny Sheep',
];

const FAKE_RECIPE_NAMES = [
  'Quantum-Entangled Spaghetti Bolognese',
  'Artisanal Toast with Hypothetical Butter',
  'Deconstructed Leftovers À La Mode',
  "The Schrodinger's Casserole (Both Burnt and Raw Until Observed)",
  'Panic-Baked Banana Bread for Unexpected Guests',
  'Existential Crisp: A Salad That Questions Its Own Existence',
  'Midnight Refrigerator Omelette (Contents May Vary)',
  'The Very Serious Gourmet Microwave Ramen',
  'Chaos-Theory Chili (Each Bowl Tastes Different)',
  'Fermented Air with a Side of Optimism',
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function pickUniqueRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ---------------------------------------------------------------------------
// Tiled placeholder image generator
// ---------------------------------------------------------------------------

/**
 * Configuration for the tiled placeholder image generation.
 *
 * Can be overridden via environment variables:
 * - FAKE_IMAGE_WIDTH        (default: 896)  Actual image width in pixels
 * - FAKE_IMAGE_HEIGHT       (default: 512)  Actual image height in pixels
 * - FAKE_IMAGE_TILES_X      (default: 8)    Number of tiles horizontally
 * - FAKE_IMAGE_TILES_Y      (default: 6)    Number of tiles vertically
 * - FAKE_IMAGE_COLOR_MIN_R  (default: 30)   Minimum red value (0-255)
 * - FAKE_IMAGE_COLOR_MAX_R  (default: 225)  Maximum red value (0-255)
 * - FAKE_IMAGE_COLOR_MIN_G  (default: 30)   Minimum green value (0-255)
 * - FAKE_IMAGE_COLOR_MAX_G  (default: 225)  Maximum green value (0-255)
 * - FAKE_IMAGE_COLOR_MIN_B  (default: 30)   Minimum blue value (0-255)
 * - FAKE_IMAGE_COLOR_MAX_B  (default: 225)  Maximum blue value (0-255)
 */
export interface PlaceholderImageConfig {
  /** Image width in pixels */
  width: number;
  /** Image height in pixels */
  height: number;
  /** Number of tiles horizontally */
  tilesX: number;
  /** Number of tiles vertically */
  tilesY: number;
  /** Minimum RGB channel values (inclusive) */
  colorMin: { r: number; g: number; b: number };
  /** Maximum RGB channel values (inclusive) */
  colorMax: { r: number; g: number; b: number };
}

/**
 * Reads PlaceholderImageConfig from environment variables,
 * falling back to defaults for any missing values.
 */
export function getPlaceholderImageConfig(): PlaceholderImageConfig {
  return {
    width: parseInt(process.env.FAKE_IMAGE_WIDTH || '896', 10),
    height: parseInt(process.env.FAKE_IMAGE_HEIGHT || '512', 10),
    tilesX: parseInt(process.env.FAKE_IMAGE_TILES_X || '8', 10),
    tilesY: parseInt(process.env.FAKE_IMAGE_TILES_Y || '6', 10),
    colorMin: {
      r: clamp(parseInt(process.env.FAKE_IMAGE_COLOR_MIN_R || '30', 10), 0, 255),
      g: clamp(parseInt(process.env.FAKE_IMAGE_COLOR_MIN_G || '30', 10), 0, 255),
      b: clamp(parseInt(process.env.FAKE_IMAGE_COLOR_MIN_B || '30', 10), 0, 255),
    },
    colorMax: {
      r: clamp(parseInt(process.env.FAKE_IMAGE_COLOR_MAX_R || '225', 10), 0, 255),
      g: clamp(parseInt(process.env.FAKE_IMAGE_COLOR_MAX_G || '225', 10), 0, 255),
      b: clamp(parseInt(process.env.FAKE_IMAGE_COLOR_MAX_B || '225', 10), 0, 255),
    },
  };
}

/**
 * Generates a random integer in [min, max] inclusive.
 */
function randomChannel(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a tiled-color placeholder image and saves it to the images
 * directory alongside real generated images.
 *
 * The image is divided into an N x M grid of tiles, each filled with
 * a random color sampled from the configurable RGB range.
 *
 * @param config   Optional override config. Uses env vars / defaults if omitted.
 * @returns        The saved image filename (e.g. "placeholder-abc123.png"),
 *                 or empty string on failure.
 */
export async function generatePlaceholderImage(
  config?: Partial<PlaceholderImageConfig>,
): Promise<string> {
  if (!isFakeDataEnabled()) {
    return '';
  }

  const cfg: PlaceholderImageConfig = {
    ...getPlaceholderImageConfig(),
    ...config,
  };

  // Validate dimensions
  if (cfg.tilesX < 1 || cfg.tilesY < 1 || cfg.width < 1 || cfg.height < 1) {
    debugLog('⚠️ [PlaceholderImage] Invalid dimensions, skipping image generation');
    return '';
  }

  const tileWidth = Math.floor(cfg.width / cfg.tilesX);
  const tileHeight = Math.floor(cfg.height / cfg.tilesY);

  try {
    const image = new Jimp({
      width: cfg.width,
      height: cfg.height,
      color: 0x000000,
    });

    for (let ty = 0; ty < cfg.tilesY; ty++) {
      for (let tx = 0; tx < cfg.tilesX; tx++) {
        const r = randomChannel(cfg.colorMin.r, cfg.colorMax.r);
        const g = randomChannel(cfg.colorMin.g, cfg.colorMax.g);
        const b = randomChannel(cfg.colorMin.b, cfg.colorMax.b);

        // Pack into 32-bit RGBA using Jimp's utility
        const hexColor = rgbaToInt(r, g, b, 255);

        const x = tx * tileWidth;
        const y = ty * tileHeight;

        // Draw the tile as a filled rectangle
        for (let py = 0; py < tileHeight; py++) {
          for (let px = 0; px < tileWidth; px++) {
            const pixelX = x + px;
            const pixelY = y + py;
            if (pixelX < cfg.width && pixelY < cfg.height) {
              image.setPixelColor(hexColor, pixelX, pixelY);
            }
          }
        }
      }
    }

    // Ensure images directory exists
    const imagesDir = getImagesDirectory();
    fs.mkdirSync(imagesDir, { recursive: true });

    const filename = `placeholder-${uuidv4()}.png`;
    const filePath = path.join(imagesDir, filename);

    const buffer = await image.getBuffer('image/png');
    await fs.promises.writeFile(filePath, buffer);

    debugLog('🖼️ [PlaceholderImage] Generated:', filename);

    return filename;
  } catch (error) {
    console.error('❌ [PlaceholderImage] Failed to generate:', error);
    return '';
  }
}

// ---------------------------------------------------------------------------
// Writer generator
// ---------------------------------------------------------------------------

function generateFakeWriter(): Writer {
  const now = new Date().toISOString();
  const name = getRandomElement(FAKE_WRITER_NAMES);
  const description = getRandomElement(FAKE_WRITER_DESCRIPTIONS);

  return {
    key: getUniqueKey(),
    name,
    description,
    systemPrompt: `You are ${name}, ${description.toLowerCase()}.`,
    profileImage: '',
    createdAt: now,
    updatedAt: now,
  };
}

// ---------------------------------------------------------------------------
// Blog / Article generators
// ---------------------------------------------------------------------------

/**
 * Generates a single fake blog article with a placeholder image.
 */
export async function generateFakeArticle(): Promise<ArticleScheme> {
  const now = new Date();
  const title = getRandomElement(FAKE_HEADLINES);
  const category = getRandomElement(FAKE_CATEGORIES);

  const imageName = await generatePlaceholderImage();

  return {
    key: getUniqueKey(),
    title,
    content: [
      `In a world where ${category.toLowerCase()} continues to surprise us, today's developments have left experts — and a local goose named Gerald — utterly bewildered.`,
      `"We've never seen anything quite like this," said Dr. ${getRandomElement(FAKE_WRITER_NAMES).split(' ')[0]}, a ${category.toLowerCase()} specialist who has been studying the phenomenon for decades.`,
      `The implications are far-reaching. If this trend continues, experts predict that by next Tuesday, ${category.toLowerCase()} as we know it will be completely transformed — or at least mildly rearranged.`,
      `Critics, however, remain skeptical. "This is clearly a coordinated effort by Big ${category === 'Food' ? 'Agriculture' : category} to push their agenda," said one vocal detractor.`,
      `At press time, Gerald the goose had no further comments, though sources say he appeared to nod knowingly before waddling off toward the pond.`,
    ].join('\n\n'),
    author: generateFakeWriter(),
    timestamp: now.toISOString(),
    category,
    headImage: imageName,
    shortDescription: `An in-depth look at how ${category.toLowerCase()} is changing — and why a goose may have all the answers.`,
    writerType: 'Synthesis',
    originalNewsItem: {
      article_id: '',
      title,
      description: '',
      pubDate: now.toISOString(),
      pubDateTZ: 'UTC',
    },
    isFeatured: false,
    featuredDate: undefined,
  };
}

/**
 * Generates an array of fake blog articles with unique headlines.
 */
export async function generateFakeArticles(count: number = 8): Promise<ArticleScheme[]> {
  const headlines = pickUniqueRandomElements(
    FAKE_HEADLINES,
    Math.min(count, FAKE_HEADLINES.length),
  );
  const categories = pickUniqueRandomElements(
    FAKE_CATEGORIES,
    Math.min(count, FAKE_CATEGORIES.length),
  );

  const articles: ArticleScheme[] = [];
  for (let index = 0; index < headlines.length; index++) {
    const title = headlines[index];
    const now = new Date();
    now.setMinutes(now.getMinutes() - index);

    const imageName = await generatePlaceholderImage();

    articles.push({
      key: getUniqueKey(),
      title,
      content: [
        `In a world where ${categories[index % categories.length].toLowerCase()} continues to surprise us, today's developments have left experts utterly bewildered.`,
        `"We've never seen anything quite like this," said Dr. ${getRandomElement(FAKE_WRITER_NAMES).split(' ')[0]}, a specialist who has been studying the phenomenon for decades.`,
        `The implications are far-reaching. If this trend continues, experts predict that by next Tuesday, everything will be completely transformed — or at least mildly rearranged.`,
        `Critics remain skeptical. "This is clearly a coordinated effort to push their agenda," said one vocal detractor.`,
        `At press time, Gerald the goose had no further comments.`,
      ].join('\n\n'),
      author: generateFakeWriter(),
      timestamp: now.toISOString(),
      category: categories[index % categories.length],
      headImage: imageName,
      shortDescription: `How ${categories[index % categories.length].toLowerCase()} is changing — and why a goose may have all the answers.`,
      writerType: 'Synthesis',
      originalNewsItem: {
        article_id: '',
        title,
        description: '',
        pubDate: now.toISOString(),
        pubDateTZ: 'UTC',
      },
      isFeatured: false,
      featuredDate: undefined,
    });
  }
  return articles;
}

/**
 * Returns a fake BlogResponse with generated articles,
 * or an empty response if fake data is disabled.
 */
export async function getFakeBlogResponse(articleCount: number = 8): Promise<BlogResponse> {
  if (!isFakeDataEnabled()) {
    return { success: true, articles: [], error: '' };
  }

  debugLog('📰 [FakeDataService] Generating fake blog articles');
  return {
    success: true,
    articles: await generateFakeArticles(articleCount),
    error: '',
  };
}

// ---------------------------------------------------------------------------
// Featured article generator
// ---------------------------------------------------------------------------

/**
 * Generates a single fake featured article with a placeholder image.
 */
export async function generateFakeFeaturedArticle(): Promise<ArticleScheme> {
  const now = new Date();
  const title = `Special Report: ${getRandomElement(FAKE_HEADLINES)}`;
  const imageName = await generatePlaceholderImage();

  return {
    key: getUniqueKey(),
    title,
    content: [
      `In a stunning turn of events, today's top story has everyone talking — including philosophers, baristas, and at least one very confused squirrel.`,
      `Our team of award-winning journalists have assembled this comprehensive analysis of what it all means for the average person. Spoiler: nobody really knows.`,
      `What we do know is that this developing situation touches on every aspect of ${getRandomElement(FAKE_CATEGORIES).toLowerCase()}, from the macro to the micro, and from the serious to the deeply silly.`,
    ].join('\n\n'),
    author: generateFakeWriter(),
    timestamp: now.toISOString(),
    category: getRandomElement(FAKE_CATEGORIES),
    headImage: imageName,
    shortDescription: `A deep dive into the news that has everyone talking — plus commentary from a squirrel.`,
    writerType: 'Synthesis',
    originalNewsItem: {
      article_id: '',
      title,
      description: '',
      pubDate: now.toISOString(),
      pubDateTZ: 'UTC',
    },
    isFeatured: true,
    featuredDate: now.toISOString().split('T')[0],
  };
}

// ---------------------------------------------------------------------------
// Recipe generator
// ---------------------------------------------------------------------------

/**
 * Generates a single fake recipe with a placeholder image.
 */
export async function generateFakeRecipe(): Promise<RecipeScheme> {
  const now = new Date();
  const title = getRandomElement(FAKE_RECIPE_NAMES);
  const writer = generateFakeWriter();
  const imageName = await generatePlaceholderImage();

  return {
    key: getUniqueKey(),
    title,
    paragraphs: [
      `Welcome, brave culinary explorer. Today we embark on a journey that will test your pantry, your patience, and your will to live.`,
      `## Ingredients\n- Whatever you have in the fridge\n- A dash of hope\n- 2 tablespoons of improvisation\n- Salt (to taste)\n- One unexpected spice you bought once and never used again`,
      `## Preparation\nPreheat your oven to a temperature that feels right. Combine all ingredients in a single bowl. Stir vigorously while thinking positively.`,
      `## Cooking\nPlace your creation in the oven until "it looks done." Check periodically. Try not to open the oven door too much.`,
      `## Serving Suggestions\nServe on a plate you forgot you owned. Garnish with herbs if you remembered to buy them. If not, garnish with confidence.`,
      `## Tips\n- If it tastes bad, add cheese.\n- If it looks bad, call it "deconstructed" or "rustic."\n- If all else fails, order pizza and try again tomorrow.`,
    ],
    author: writer,
    timestamp: now.toISOString(),
    category: 'Food',
    headImage: imageName,
    images: [],
    shortDescription: `A forgiving recipe that works with whatever you have on hand — and a healthy dose of self-deprecation.`,
    writerType: 'Synthesis',
  };
}

/**
 * Generates an array of fake recipes with unique titles.
 */
export async function generateFakeRecipes(count: number = 4): Promise<RecipeScheme[]> {
  const names = pickUniqueRandomElements(
    FAKE_RECIPE_NAMES,
    Math.min(count, FAKE_RECIPE_NAMES.length),
  );

  const recipes: RecipeScheme[] = [];
  for (let index = 0; index < names.length; index++) {
    const now = new Date();
    now.setMinutes(now.getMinutes() - index);
    const imageName = await generatePlaceholderImage();

    recipes.push({
      key: getUniqueKey(),
      title: names[index],
      paragraphs: [
        `Welcome, brave culinary explorer. Today we embark on a journey that will test your pantry and your patience.`,
        `## Ingredients\n- Whatever you have in the fridge\n- A dash of hope\n- 2 tablespoons of improvisation\n- Salt (to taste)`,
        `## Preparation\nPreheat your oven to a temperature that feels right. Combine all ingredients. Stir vigorously.`,
        `## Cooking\nBake until "it looks done." Check periodically.`,
        `## Tips\nIf it tastes bad, add cheese. If it looks bad, call it "rustic."`,
      ],
      author: generateFakeWriter(),
      timestamp: now.toISOString(),
      category: 'Food',
      headImage: imageName,
      images: [],
      shortDescription: `A forgiving recipe that works with whatever you have on hand.`,
      writerType: 'Synthesis',
    });
  }
  return recipes;
}

// ---------------------------------------------------------------------------
// Horoscope generator
// ---------------------------------------------------------------------------

/**
 * Generates fake horoscopes for all 12 zodiac signs for today.
 */
export function generateFakeHoroscopes(): Horoscope[] {
  const today = new Date().toISOString().split('T')[0];

  return ZODIAC_SIGNS.map((sign) => ({
    date: today,
    zodiacSign: sign,
    content: [
      `Dear ${sign}, the stars are feeling playful today.`,
      `The cosmic alignment suggests you might find a forgotten snack in your coat pocket.`,
      `Mercury's position indicates you'll say something you immediately regret — but don't worry, nobody was really listening anyway.`,
      `Venus whispers that it's a good day to text that person you've been thinking about, but only if you lead with a funny meme.`,
      `Remember, ${sign}: every day is a good day to take a nap. The universe supports your decision to rest.`,
    ].join(' '),
    astrologicalData: {
      date: today,
      planets: [
        {
          name: 'Sun',
          longitude: 0,
          latitude: 0,
          sign: sign,
          isRetrograde: false,
        },
        {
          name: 'Moon',
          longitude: 60,
          latitude: 0,
          sign: 'Gemini',
          isRetrograde: false,
        },
        {
          name: 'Mercury',
          longitude: 30,
          latitude: 0,
          sign: 'Taurus',
          isRetrograde: false,
        },
      ],
      retrogrades: [],
      notableAspects: ['Sun trine Your Sense of Humor'],
    },
    createdAt: today,
  }));
}
