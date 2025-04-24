export interface GenerateContentRequest {
  provider: 'openai' | 'deepseek';
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  type: any = 'text';
}

export interface GenerateContentResponse {
  success: boolean;
  generatedText: string;
  error?: string;  
}
