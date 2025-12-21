import 'dotenv/config'
import { Writer } from '../types/writer.js';
import { NewsItem } from './newsService.js';
import { generateTextFromString } from './llmService.js';
import { debugLog, debugError } from '../utils/debugLogger.js';
import { getStylePromptAdditions, selectStyleForNewsItem } from './styleService.js';

export type EditorialStage = 'draft' | 'structural_edit' | 'humor_edit' | 'copy_edit' | 'ready';
export type EditorNotes = {
    structural_notes?: string[];
    humor_notes?: string[];
    copy_notes?: string[];
    overall_feedback?: string;
};

/**
 * Create a draft article from a news item with a specific style
 */
export async function createDraft(
    writer: Writer, 
    newsItem: NewsItem, 
    styleKey: string = 'general_newspaper_parody'
): Promise<string | undefined> {
    try {
        debugLog(`Creating draft article in style: ${styleKey}`);
        
        // Get style-specific prompt additions
        const styleAdditions = getStylePromptAdditions(styleKey);
        
        // Build the prompt with style integration
        const prompt = buildDraftPrompt(writer, newsItem, styleAdditions);
        
        debugLog("Generating draft article");
        const result = await generateTextFromString(prompt, 'text');
        
        if (result === undefined || !result?.success) {
            debugError("Draft generation failed!");
            return undefined;
        }

        return result.generatedText;
    } catch (error) {
        debugError('Error creating draft:', error);
        return undefined;
    }
}

/**
 * Apply structural editing to improve organization and add context
 */
export async function structuralEdit(draftContent: string, originalNewsItem: NewsItem): Promise<string | undefined> {
    try {
        debugLog("Applying structural editing");
        
        const prompt = buildStructuralEditPrompt(draftContent, originalNewsItem);
        const result = await generateTextFromString(prompt, 'text');
        
        if (result === undefined || !result?.success) {
            debugError("Structural editing failed!");
            return draftContent; // Return original if editing fails
        }

        return result.generatedText;
    } catch (error) {
        debugError('Error in structural editing:', error);
        return draftContent; // Return original if editing fails
    }
}

/**
 * Apply humor editing to enhance comedic elements subtly
 */
export async function humorEdit(articleContent: string, styleKey: string): Promise<string | undefined> {
    try {
        debugLog("Applying humor editing");
        
        const prompt = buildHumorEditPrompt(articleContent, styleKey);
        const result = await generateTextFromString(prompt, 'text');
        
        if (result === undefined || !result?.success) {
            debugError("Humor editing failed!");
            return articleContent; // Return original if editing fails
        }

        return result.generatedText;
    } catch (error) {
        debugError('Error in humor editing:', error);
        return articleContent; // Return original if editing fails
    }
}

/**
 * Apply copy editing for grammar, style, and readability
 */
export async function copyEdit(articleContent: string, styleKey: string): Promise<string | undefined> {
    try {
        debugLog("Applying copy editing");
        
        const prompt = buildCopyEditPrompt(articleContent, styleKey);
        const result = await generateTextFromString(prompt, 'text');
        
        if (result === undefined || !result?.success) {
            debugError("Copy editing failed!");
            return articleContent; // Return original if editing fails
        }

        return result.generatedText;
    } catch (error) {
        debugError('Error in copy editing:', error);
        return articleContent; // Return original if editing fails
    }
}

/**
 * Full editorial pipeline: draft -> structural edit -> humor edit -> copy edit
 */
export async function runEditorialPipeline(
    writer: Writer,
    newsItem: NewsItem,
    styleKey?: string
): Promise<{ content: string; editorNotes: EditorNotes; styleUsed: string } | undefined> {
    try {
        debugLog("📝 [runEditorialPipeline] Starting editorial pipeline");
        debugLog("📝 [runEditorialPipeline] Writer:", writer.name);
        debugLog("📝 [runEditorialPipeline] News item:", newsItem.title);
        debugLog("📝 [runEditorialPipeline] Style key:", styleKey || 'auto-select');
        
        // Select style if not provided
        const selectedStyle = styleKey || selectStyleForNewsItem(newsItem);
        debugLog(`📝 [runEditorialPipeline] Selected style: ${selectedStyle}`);
        
        // Create draft
        debugLog("📝 [runEditorialPipeline] Creating draft...");
        const draft = await createDraft(writer, newsItem, selectedStyle);
        if (!draft) {
            debugError("❌ [runEditorialPipeline] Failed to create draft");
            return undefined;
        }
        debugLog("✅ [runEditorialPipeline] Draft created, length:", draft.length, "characters");
        
        const editorNotes: EditorNotes = {};
        
        // Structural edit
        debugLog("📝 [runEditorialPipeline] Applying structural edit...");
        const structurallyEdited = await structuralEdit(draft, newsItem);
        if (structurallyEdited && structurallyEdited !== draft) {
            editorNotes.structural_notes = ["Improved narrative flow and added context"];
            debugLog("✅ [runEditorialPipeline] Structural edit applied");
        } else {
            debugLog("📝 [runEditorialPipeline] No structural changes needed");
        }
        
        // Humor edit
        debugLog("📝 [runEditorialPipeline] Applying humor edit...");
        const humorEdited = await humorEdit(structurallyEdited || draft, selectedStyle);
        if (humorEdited && humorEdited !== (structurallyEdited || draft)) {
            editorNotes.humor_notes = ["Enhanced comedic timing and subtlety"];
            debugLog("✅ [runEditorialPipeline] Humor edit applied");
        } else {
            debugLog("📝 [runEditorialPipeline] No humor changes needed");
        }
        
        // Copy edit
        debugLog("📝 [runEditorialPipeline] Applying copy edit...");
        const copyEdited = await copyEdit(humorEdited || structurallyEdited || draft, selectedStyle);
        if (copyEdited && copyEdited !== (humorEdited || structurallyEdited || draft)) {
            editorNotes.copy_notes = ["Improved grammar, style, and readability"];
            debugLog("✅ [runEditorialPipeline] Copy edit applied");
        } else {
            debugLog("📝 [runEditorialPipeline] No copy changes needed");
        }
        
        const finalContent = copyEdited || humorEdited || structurallyEdited || draft;
        debugLog("✅ [runEditorialPipeline] Editorial pipeline completed successfully");
        debugLog("📝 [runEditorialPipeline] Final content length:", finalContent.length, "characters");
        
        return {
            content: finalContent,
            editorNotes,
            styleUsed: selectedStyle
        };
    } catch (error) {
        debugError('❌ [runEditorialPipeline] Error in editorial pipeline:', error);
        return undefined;
    }
}

// ----------------------------------------------- PROMPT BUILDING FUNCTIONS -----------------------------------------------

function buildDraftPrompt(writer: Writer, newsItem: NewsItem, styleAdditions: any): string {
    return `
Roleplay as a journalist writing a parody news article. ${styleAdditions.system_prompt_addition}

${writer.name !== "" ? "Your name is " + writer.name + "." : ""}
${writer.description !== "" ? "Your description is " + writer.description + "." : ""}
${writer.systemPrompt !== "" ? "A further prompt that defines you and how you write: \n\n" + writer.systemPrompt : ""}

${newsItem.title !== "" ? `Write a parody news article based on this real news story:\n\n TITLE: \n${newsItem.title}` : ""}
${(newsItem.description !== null && newsItem.description !== "" ? `\n DESCRIPTION: \n${newsItem.description}` : "")}

${styleAdditions.user_prompt_addition}

Requirements:
1. Write a complete parody news article (500-800 words)
2. Maintain the "${styleAdditions.system_prompt_addition.split('"')[1]}" style throughout
3. Include subtle, intelligent humor rather than obvious jokes
4. Structure: Start directly with the lead paragraph (the opening paragraph of the article), followed by body paragraphs (3-5 paragraphs), and a concluding paragraph
5. Ensure the parody is recognizable from the original news story
6. Focus on logical extremes and subtle exaggeration
7. CRITICAL: Do NOT include a title, headline, or heading anywhere in the article content. The article should start directly with the body text. No title should appear in the content itself.
8. Do NOT use labels like "Headline:", "Lead:", "Subhead:", or any other section markers
9. Do NOT use markdown formatting like **bold** for section labels or titles
10. Write in plain text with proper paragraph breaks: Use TWO newlines (blank line) between paragraphs
11. Format for markdown: Ensure paragraphs are clearly separated so they render correctly in markdown viewers

Write only the article body content, starting with the opening paragraph. No title, no headline, no JSON, no additional formatting.
`;
}

function buildStructuralEditPrompt(draftContent: string, originalNewsItem: NewsItem): string {
    return `
You are a structural editor for a parody news publication. Your task is to improve the organization and flow of this draft article.

ORIGINAL NEWS STORY:
Title: ${originalNewsItem.title}
${originalNewsItem.description ? `Description: ${originalNewsItem.description}` : ''}

DRAFT ARTICLE:
${draftContent}

Please edit this article to improve:
1. Narrative flow - ensure the story progresses logically
2. Context - add necessary background information about the real news story
3. Structure - improve paragraph transitions and overall organization
4. Clarity - make sure the parody is clear and recognizable
5. Length - ensure appropriate article length (500-800 words)

CRITICAL: Do NOT add a title, headline, or heading to the article. The article should start directly with the body text. If there is any title or headline in the content, remove it.

IMPORTANT: Preserve proper paragraph formatting with TWO newlines (blank line) between paragraphs for markdown rendering.

Do not change the comedic style or voice. Focus only on structural improvements.

Return the edited article content only, no explanations or notes.
`;
}

function buildHumorEditPrompt(articleContent: string, styleKey: string): string {
    const styleDescriptions: Record<string, string> = {
        'general_newspaper_parody': 'subtle exaggeration and logical extremes',
        'victorian_sensationalist': 'dramatic, over-the-top Victorian language',
        'corporate_bs': 'corporate jargon and buzzwords',
        'conspiracy_theorist': 'suspicious connections and hidden agendas',
        'tech_bro_hype': 'tech startup hype and jargon',
        'academic_pretentious': 'academic complexity and jargon',
        'clickbait_farmer': 'hyperbolic, clickbait-style writing',
        'local_news_earnest': 'overly sincere local news treatment'
    };

    const styleDescription = styleDescriptions[styleKey] || 'subtle parody';

    return `
You are a humor editor for a parody news publication. Your task is to enhance the comedic elements of this article while maintaining its style.

ARTICLE STYLE: ${styleKey} (${styleDescription})

ARTICLE CONTENT:
${articleContent}

Please edit this article to improve:
1. Comedic timing - ensure jokes land effectively
2. Subtlety - enhance subtle humor rather than adding obvious jokes
3. Consistency - maintain the ${styleKey} style throughout
4. Punchlines - strengthen any weak punchlines
5. Flow - ensure humor flows naturally with the narrative

CRITICAL: Do NOT add a title, headline, or heading to the article. The article should start directly with the body text. If there is any title or headline in the content, remove it.

IMPORTANT: Preserve proper paragraph formatting with TWO newlines (blank line) between paragraphs for markdown rendering.

Do not change the basic structure or factual parody elements. Focus only on enhancing the humor.

Return the edited article content only, no explanations or notes.
`;
}

function buildCopyEditPrompt(articleContent: string, styleKey: string): string {
    return `
You are a copy editor for a parody news publication. Your task is to improve grammar, style, and readability while preserving the comedic voice.

ARTICLE STYLE: ${styleKey}

ARTICLE CONTENT:
${articleContent}

Please edit this article to:
1. Fix any grammar, spelling, or punctuation errors
2. Improve sentence structure and flow
3. Ensure consistent tone and voice for the ${styleKey} style
4. Enhance readability while preserving comedic elements
5. Check for awkward phrasing or unclear passages

CRITICAL: Do NOT add a title, headline, or heading to the article. The article should start directly with the body text. If there is any title or headline in the content, remove it.

IMPORTANT: Preserve proper paragraph formatting with TWO newlines (blank line) between paragraphs for markdown rendering.

Do not change the humor or substantive content. Focus only on copy editing improvements.

Return the edited article content only, no explanations or notes.
`;
}
