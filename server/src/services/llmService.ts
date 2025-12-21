import 'dotenv/config'
import { OpenAI } from 'openai';

import { GenerateContentRequest, GenerateContentResponse } from '../types/llm.js';
import { debugLog } from '../utils/debugLogger.js';

// TODO: add other such service activated flags in the other services!
const SERVICE_ACTIVATED: boolean = true;

// TODO: unused
type LLMProvider = 'openai' | 'deepseek';

export class LLMService {
  private openai: OpenAI;

  constructor() {
    // TODO: magic strings
    this.openai = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: process.env.DEEPSEEK_API_KEY
    });
  }

  public async generateContent(options: GenerateContentRequest): Promise<GenerateContentResponse> {    
    let contentRes: GenerateContentResponse = {
      success: false,
      generatedText: "",
      error: ""
    };
    
    if (!SERVICE_ACTIVATED) {
      debugLog('⚠️ [LLMService] Service not activated, returning empty response');
      return contentRes;
    }

    try {
      debugLog('📝 [LLMService] Generating content with type:', options.type);
      debugLog('📝 [LLMService] Prompt length:', options.prompt.length, 'characters');
      debugLog('📝 [LLMService] Prompt preview:', options.prompt.substring(0, 200) + '...');
      
      // TODO: fix model and make it in .env as a dictionary?
      const completion = await this.openai.chat.completions.create({
        messages: [{ role: "system", content: options.prompt }],
        model: "deepseek-reasoner",
        response_format: {
          'type': options.type
        }
      });      
      
      debugLog('✅ [LLMService] LLM API call successful');
      debugLog('📝 [LLMService] Response received, choices:', completion.choices.length);
      
      // TODO: what do I do with the return statement here with the ? parts
      contentRes = {
        success: true,
        generatedText: completion?.choices[0]?.message.content as string,
        error: ""
      };

      debugLog('📝 [LLMService] Generated text length:', contentRes.generatedText?.length || 0, 'characters');
      debugLog('📝 [LLMService] Generated text preview:', contentRes.generatedText?.substring(0, 200) + '...');

      // return completion?.choices[0]?.message.content as string;
    } catch (error) {
      // TODO: no point not returning this?
      contentRes = {
        success: false,
        generatedText: "",
        error: error as string
      };

      debugLog('❌ [LLMService] LLM generation error:', error);
      throw new Error('Content generation failed');
    }

    return contentRes;
  }
}

export async function generateTextFromString(prompt: string, type: string = 'text', temperature: number = 0.8): Promise<GenerateContentResponse | undefined> {
    try {
        const request: GenerateContentRequest = {
            provider: 'deepseek',
            prompt: prompt,
            type: type,
            temperature: temperature
        };
        
        const llmServiceInst = new LLMService();
        const result = await llmServiceInst.generateContent(request);

        return result;
    } catch (error) {
        debugLog("Text Generation error: ", error);
        throw new Error('Text generation from string failed');
    }
}

export async function getBooleanResponse(
  prompt: string,
  temperature: number = 0.1 // Lower temperature for deterministic output
): Promise<boolean> {
  try {
    // Force the model to respond with only "true" or "false"
    const strictPrompt = `
      Answer the following question with **only** "true" or "false". 
      Do not provide any explanation or additional text.
      Question: ${prompt}
    `;

    const response: GenerateContentResponse | undefined = await generateTextFromString(
      strictPrompt,
      'text', // text or 'json_object' if DeepSeek supports it
      temperature
    );

    if (!response?.success || !response.generatedText) {
      throw new Error("Failed to get a valid response from the model.");
    }

    const normalizedAnswer = response.generatedText.trim().toLowerCase();

    if (normalizedAnswer === "true") return true;
    if (normalizedAnswer === "false") return false;

    throw new Error(`Model returned an invalid boolean response: "${response.generatedText}"`);
  } catch (error) {
    console.error("Boolean response generation failed:", error);
    throw new Error(`Could not determine boolean answer: ${error instanceof Error ? error.message : String(error)}`);
  }
}
