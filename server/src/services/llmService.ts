import 'dotenv/config'
import { OpenAI } from 'openai';

import { GenerateContentRequest, GenerateContentResponse } from '../types/llm';

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
    
    try {
      // TODO: fix model and make it in .env as a dictionary?
      const completion = await this.openai.chat.completions.create({
        messages: [{ role: "system", content: options.prompt }],
        model: "deepseek-chat",
        response_format: {
          'type': options.type
        }
      });      
      
      // TODO: what do I do with the return statement here with the ? parts
      contentRes = {
        success: true,
        generatedText: completion?.choices[0]?.message.content as string,
        error: ""
      };

      // return completion?.choices[0]?.message.content as string;
    } catch (error) {
      // TODO: no point not returning this?
      contentRes = {
        success: false,
        generatedText: "",
        error: error as string
      };

      console.log('LLM generation error:', error);
      throw new Error('Content generation failed');
    }

    return contentRes;
  }
}
