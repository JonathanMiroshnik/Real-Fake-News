import 'dotenv/config'
import { debugLog, debugError } from '../utils/debugLogger.js';
import { getDatabase } from '../lib/database/database.js';

export type ArticleStyle = {
    style_key: string;
    name: string;
    description: string;
    voice_guidelines: string;
    comedic_approach: string;
    example_headline?: string;
    example_paragraph?: string;
    is_default: boolean;
    created_at: string;
};

export type StylePromptAddition = {
    system_prompt_addition: string;
    user_prompt_addition: string;
};

/**
 * Default style: general_newspaper_parody
 * Used for majority of articles (professional newspaper tone with subtle comedic exaggeration)
 */
const DEFAULT_STYLE: ArticleStyle = {
    style_key: 'general_newspaper_parody',
    name: 'General Newspaper Parody',
    description: 'Professional newspaper tone with subtle comedic exaggeration. Clear structure: headline, lead, body, conclusion. Humor derived from logical extremes of real situations.',
    voice_guidelines: 'Professional, journalistic tone. Clear, concise sentences. Subtle humor through exaggeration of real-world logic. Avoid overt jokes or punchlines.',
    comedic_approach: 'Logical extremes, subtle exaggeration, deadpan delivery of absurd situations.',
    example_headline: 'Mars Colony Declares Independence, Cites Overdue Amazon Packages',
    example_paragraph: 'In a surprise announcement early Tuesday, the Martian colony "New Dawn" declared independence from Earth, citing logistical delays and an overreliance on Earth-based bureaucracy. The final straw, according to Governor Aila Ren, was a six-month delay in a shipment of essential coffee beans and board games.',
    is_default: true,
    created_at: new Date().toISOString()
};

/**
 * Special comedic styles for variety (used for ~10% of articles)
 */
const SPECIAL_STYLES: ArticleStyle[] = [
    {
        style_key: 'victorian_sensationalist',
        name: 'Victorian Sensationalist',
        description: 'Old‑timey language, dramatic flair, sensational reporting style.',
        voice_guidelines: 'Florid, dramatic language. Use archaic terms and formal structure. Emphasize drama and sensation.',
        comedic_approach: 'Over-the-top drama, archaic language, treating modern events as Victorian scandals.',
        example_headline: 'A Most Extraordinary Affair: Mechanical Contraption Claims Sentience!',
        example_paragraph: 'In a development that has sent shockwaves through polite society, a mechanical contrivance of the most advanced design has purportedly declared itself possessed of consciousness and feeling. Experts are aghast, and moralists decry this affront to natural order.',
        is_default: false,
        created_at: new Date().toISOString()
    },
    {
        style_key: 'corporate_bs',
        name: 'Corporate Buzzword',
        description: 'Buzzword‑filled, empty‑meaning corporate speak.',
        voice_guidelines: 'Overuse corporate jargon, buzzwords, and management speak. Focus on synergy, leverage, and paradigm shifts.',
        comedic_approach: 'Applying meaningless corporate jargon to real news events.',
        example_headline: 'Lunar Entity Leverages Synergistic Orbit Optimization for Enhanced Celestial Value Proposition',
        example_paragraph: 'In a groundbreaking move to maximize stakeholder alignment, the lunar entity has initiated a paradigm-shifting orbital recalibration initiative. This disruptive innovation leverages cross-functional gravitational synergies to deliver enhanced nocturnal illumination deliverables.',
        is_default: false,
        created_at: new Date().toISOString()
    },
    {
        style_key: 'conspiracy_theorist',
        name: 'Conspiracy Theorist',
        description: 'Everything is connected, hidden agendas, suspicious patterns.',
        voice_guidelines: 'Suspicious, questioning tone. Suggest hidden connections and agendas. Use rhetorical questions.',
        comedic_approach: 'Finding absurd connections and conspiracies in ordinary events.',
        example_headline: 'Coincidence? New Coffee Shop Opens Exactly 666 Feet From City Hall',
        example_paragraph: 'They want you to think it\'s just another artisan coffee shop. But the location—exactly 666 feet from the seat of municipal power—tells a different story. Is this about caffeine, or control? The patterns don\'t lie.',
        is_default: false,
        created_at: new Date().toISOString()
    },
    {
        style_key: 'tech_bro_hype',
        name: 'Tech Bro Hype',
        description: 'Over‑optimistic, jargon‑heavy tech evangelism.',
        voice_guidelines: 'Enthusiastic, hype-driven language. Use tech buzzwords: disruptive, scalable, blockchain, AI, Web3.',
        comedic_approach: 'Applying tech startup hype to mundane situations.',
        example_headline: 'Disruptive Avian Startup Leverages AI-Powered Nesting Protocol',
        example_paragraph: 'This isn\'t just birdwatching—it\'s a paradigm shift in ornithological observation. Our AI-driven, blockchain-verified nesting solution represents a scalable, disruptive approach to traditional avian habitation patterns.',
        is_default: false,
        created_at: new Date().toISOString()
    },
    {
        style_key: 'academic_pretentious',
        name: 'Academic Pretentious',
        description: 'Unnecessarily complex, citation‑heavy academic writing.',
        voice_guidelines: 'Overly complex sentences, academic jargon, frequent references to theories and scholars.',
        comedic_approach: 'Applying academic complexity to simple events.',
        example_headline: 'A Post-Structuralist Analysis of Canine Digging Behavior in Urban Parks',
        example_paragraph: 'The canine subject, operating within a Foucauldian framework of disciplinary space, engages in a deconstruction of the hegemonic lawn-text through iterative excavation. This represents not mere instinct, but a performative critique of anthropocentric landscape design.',
        is_default: false,
        created_at: new Date().toISOString()
    },
    {
        style_key: 'clickbait_farmer',
        name: 'Clickbait Farmer',
        description: 'Outrageous headlines, shallow content, listicles.',
        voice_guidelines: 'Hyperbolic headlines, list format, cliffhangers, exaggerated claims.',
        comedic_approach: 'Applying clickbait tactics to news reporting.',
        example_headline: 'You Won\'t Believe What This Cat Did Next! Number 7 Will Shock You!',
        example_paragraph: 'In a development that has the internet completely losing its mind, a feline resident of suburban Cleveland has engaged in behavior so unexpected, so unprecedented, that experts are literally speechless. Here are 10 reasons why this changes everything.',
        is_default: false,
        created_at: new Date().toISOString()
    },
    {
        style_key: 'local_news_earnest',
        name: 'Local News Earnest',
        description: 'Overly sincere small‑town reporting on minor events.',
        voice_guidelines: 'Sincere, community-focused tone. Treat minor events as major news. Focus on human interest.',
        comedic_approach: 'Applying serious local news treatment to trivial or absurd events.',
        example_headline: 'Community Rallies Around Misplaced Garden Gnome',
        example_paragraph: 'In a heartwarming display of neighborhood solidarity, residents of Maple Street have come together to locate a missing garden ornament. "He\'s been part of our community for years," said emotional homeowner Martha Jenkins. "We just want him home."',
        is_default: false,
        created_at: new Date().toISOString()
    }
];

/**
 * Get all available article styles
 */
export function getAllStyles(): ArticleStyle[] {
    return [DEFAULT_STYLE, ...SPECIAL_STYLES];
}

/**
 * Get a specific style by key
 */
export function getStyleByKey(styleKey: string): ArticleStyle | undefined {
    const allStyles = getAllStyles();
    return allStyles.find(style => style.style_key === styleKey);
}

/**
 * Get the default style (general_newspaper_parody)
 */
export function getDefaultStyle(): ArticleStyle {
    return DEFAULT_STYLE;
}

/**
 * Get style-specific prompt additions for LLM generation
 */
export function getStylePromptAdditions(styleKey: string): StylePromptAddition {
    const style = getStyleByKey(styleKey);
    
    if (!style) {
        debugWarn(`Style ${styleKey} not found, using default style`);
        return getDefaultStylePromptAdditions();
    }

    // Base system prompt addition for all styles
    const systemAddition = `You are writing in the "${style.name}" style: ${style.description}\n\nVoice Guidelines: ${style.voice_guidelines}\n\nComedic Approach: ${style.comedic_approach}`;

    // User prompt addition with examples
    const userAddition = style.example_headline && style.example_paragraph 
        ? `\n\nExample of this style:\nHeadline: ${style.example_headline}\nParagraph: ${style.example_paragraph}\n\nWrite your article in this exact style.`
        : `\n\nWrite your article in this exact style.`;

    return {
        system_prompt_addition: systemAddition,
        user_prompt_addition: userAddition
    };
}

/**
 * Get default style prompt additions
 */
export function getDefaultStylePromptAdditions(): StylePromptAddition {
    return getStylePromptAdditions('general_newspaper_parody');
}

/**
 * Determine which style to use for a given news item
 * Default style used for 90% of articles, special styles for 10%
 * Special styles can also be triggered by topic affinity
 */
export function selectStyleForNewsItem(newsItem: any, useSpecialStyleProbability: number = 0.1): string {
    // TODO: Implement topic affinity matching
    // For now, use random selection with probability
    
    if (Math.random() < useSpecialStyleProbability) {
        // Randomly select a special style
        const specialStyleKeys = SPECIAL_STYLES.map(style => style.style_key);
        const randomIndex = Math.floor(Math.random() * specialStyleKeys.length);
        return specialStyleKeys[randomIndex];
    }
    
    return DEFAULT_STYLE.style_key;
}

/**
 * Initialize styles in the database (to be called on startup)
 */
export async function initializeStylesInDatabase(): Promise<void> {
    try {
        const db = getDatabase();
        
        // Check if styles table exists and insert default styles
        const existingStyles = db.prepare('SELECT COUNT(*) as count FROM article_styles').get() as { count: number };
        
        if (existingStyles.count === 0) {
            debugLog('Inserting default article styles into database...');
            
            const insertStmt = db.prepare(`
                INSERT INTO article_styles (
                    style_key, name, description, voice_guidelines, comedic_approach, 
                    example_headline, example_paragraph, is_default, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            
            const allStyles = getAllStyles();
            for (const style of allStyles) {
                insertStmt.run(
                    style.style_key,
                    style.name,
                    style.description,
                    style.voice_guidelines,
                    style.comedic_approach,
                    style.example_headline || null,
                    style.example_paragraph || null,
                    style.is_default ? 1 : 0,
                    style.created_at
                );
            }
            
            debugLog(`Inserted ${allStyles.length} styles into database`);
        } else {
            debugLog(`Style database already contains ${existingStyles.count} styles`);
        }
        
        debugLog(`Style service initialized with ${getAllStyles().length} styles`);
        debugLog(`Default style: ${DEFAULT_STYLE.name}`);
    } catch (error) {
        debugError('Failed to initialize styles in database:', error);
    }
}

// Helper function for debug logging
function debugWarn(message: string, ...args: any[]): void {
    console.warn(`⚠️ [styleService] ${message}`, ...args);
}
