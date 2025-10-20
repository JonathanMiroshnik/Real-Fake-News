// import 'dotenv/config';
// import { VALID_CATEGORIES } from '../config/constants.js';
// import { ArticleScheme } from '../types/article';
// import { Writer } from '../types/writer';
// import { generateAndSaveImage } from './imageService.js';
// import { generateTextFromString } from './llmService.js';
// import { getNRandom, getUniqueKey } from '../utils/general.js';
// import { ChatDeepSeek } from "@langchain/deepseek";
// import { createPost } from '../lib/lowdb/lowdbOperations.js';

// // ----------------------------------------------- SPECIAL ARTICLES LOGIC -----------------------------------------------

// // Speech and dialogue types for AI conversations
// const SPEECH_TYPES = [
//     "dialogue", "duologue", "monologue", "dramatic", "conversational", "debate", "interview", "roundtable",
//     "panel discussion", "socratic dialogue", "rap battle", "poetry slam", "storytelling", "confession",
//     "elevator pitch", "sales pitch", "political speech", "academic lecture", "stand-up comedy", "podcast",
//     "news broadcast", "weather report", "sports commentary", "cooking show", "travel vlog", "book review",
//     "movie review", "restaurant review", "product review", "tutorial", "workshop", "seminar", "conference",
//     "press conference", "court testimony", "wedding toast", "eulogy", "motivational speech", "rant",
//     "confession", "apology", "celebration", "roast", "tribute", "announcement", "proclamation"
// ];

// // Interface for conversation format specification
// interface ConversationFormat {
//     title: string;
//     category: string;
//     description: string;
//     participants: number;
//     format: string;
//     rules: string[];
//     imagePrompt: string;
//     shortDescription: string;
// }

// // Interface for special article
// interface SpecialArticleScheme extends ArticleScheme {
//     key: string;
//     title: string;
//     content: string;
//     author: Writer[];
//     timestamp: string;
//     category: string;
//     headImage: string;
//     shortDescription: string;
//     conversationFormat: ConversationFormat;
//     participants: Writer[];
// }

// // LangChain chat model for generating conversation formats
// const conversationModel = new ChatDeepSeek({
//     model: "deepseek-chat",
//     temperature: 0.8,
//     apiKey: process.env.DEEPSEEK_API_KEY,
//     maxTokens: 500
// });

// /**
//  * Generates a conversation format based on randomly selected speech types
//  * @param speechTypes Array of speech types to base the conversation on
//  * @returns Promise<ConversationFormat | undefined>
//  */
// async function generateConversationFormat(speechTypes: string[]): Promise<ConversationFormat | undefined> {
//     const prompt = `
//     Create a conversation format specification based on these speech types: ${speechTypes.join(', ')}.
    
//     Generate a JSON response with the following structure:
//     {
//         "title": "Creative title for this conversation",
//         "category": "One of: ${VALID_CATEGORIES.join(', ')}",
//         "description": "Detailed description of the conversation format",
//         "participants": number of AI participants needed,
//         "format": "Specific format description (e.g., 'debate between 3 AIs', 'roundtable discussion')",
//         "rules": ["Rule 1", "Rule 2", "Rule 3"],
//         "imagePrompt": "Prompt for generating an illustrative image",
//         "shortDescription": "Brief 1-2 line description"
//     }
    
//     Make it creative and engaging. The conversation should be between multiple AI participants.
//     `;

//     const result = await generateTextFromString(prompt, 'json_object');
//     if (!result?.success) {
//         console.error("Failed to generate conversation format");
//         return undefined;
//     }

//     try {
//         return JSON.parse(result.generatedText);
//     } catch (error) {
//         console.error("Failed to parse conversation format JSON:", error);
//         return undefined;
//     }
// }

// /**
//  * Generates the actual conversation content based on the format
//  * @param format The conversation format specification
//  * @param participants Array of writer personalities to use
//  * @returns Promise<string | undefined>
//  */
// async function generateConversationContent(format: ConversationFormat, participants: Writer[]): Promise<string | undefined> {
//     const prompt = `
//     Generate a conversation article based on this format:
    
//     Title: ${format.title}
//     Category: ${format.category}
//     Format: ${format.format}
//     Participants: ${format.participants}
//     Rules: ${format.rules.join(', ')}
    
//     Create a conversation between ${format.participants} AI participants. Each participant should have a distinct personality and perspective.
    
//     The conversation should be written in markdown format with clear speaker identification and engaging dialogue.
//     Make it entertaining, informative, and follow the specified format and rules.
    
//     Return the content as a markdown-formatted conversation.
//     `;

//     const result = await generateTextFromString(prompt, 'text');
//     if (!result?.success) {
//         console.error("Failed to generate conversation content");
//         return undefined;
//     }

//     return result.generatedText;
// }

// /**
//  * Creates a special article with AI conversation content
//  * @param writers Array of writer personalities to use
//  * @param numSpeechTypes Number of speech types to randomly select
//  * @returns Promise<SpecialArticleScheme | undefined>
//  */
// export async function createSpecialArticle(writers: Writer[], numSpeechTypes: number = 3): Promise<SpecialArticleScheme | undefined> {
//     try {
//         // Randomly select speech types
//         const selectedSpeechTypes = getNRandom(SPEECH_TYPES, numSpeechTypes);
//         console.log("Selected speech types:", selectedSpeechTypes);

//         // Generate conversation format
//         const conversationFormat = await generateConversationFormat(selectedSpeechTypes);
//         if (!conversationFormat) {
//             console.error("Failed to generate conversation format");
//             return undefined;
//         }

//         // Select participants based on the format requirements
//         const numParticipants = Math.min(conversationFormat.participants, writers.length);
//         const selectedWriters = getNRandom(writers, numParticipants);

//         // Generate the conversation content
//         const conversationContent = await generateConversationContent(conversationFormat, selectedWriters);
//         if (!conversationContent) {
//             console.error("Failed to generate conversation content");
//             return undefined;
//         }

//         // Generate image for the article
//         const imgName = await generateAndSaveImage(conversationFormat.imagePrompt);

//         // Create the special article
//         const specialArticle: SpecialArticleScheme = {
//             key: getUniqueKey(),
//             title: conversationFormat.title,
//             content: conversationContent,
//             author: selectedWriters,
//             timestamp: (new Date()).toUTCString(),
//             category: conversationFormat.category,
//             headImage: imgName,
//             shortDescription: conversationFormat.shortDescription,
//             conversationFormat: conversationFormat,
//             participants: selectedWriters
//         };

//         // TODO: Save to database - you'll need to create a database configuration for special articles
//         // await createPost<SpecialArticleScheme>(specialArticle, specialArticleDatabaseConfig);
        
//         console.log("Created special article:", specialArticle.title);
//         return specialArticle;

//     } catch (error) {
//         console.error("Error creating special article:", error);
//         return undefined;
//     }
// }

// /**
//  * Gets all available speech types
//  * @returns Array of all speech types
//  */
// export function getAvailableSpeechTypes(): string[] {
//     return [...SPEECH_TYPES];
// }

// /**
//  * Gets a random selection of speech types
//  * @param count Number of speech types to select
//  * @returns Array of randomly selected speech types
//  */
// export function getRandomSpeechTypes(count: number): string[] {
//     return getNRandom(SPEECH_TYPES, count);
// }
