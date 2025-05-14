export interface Question {
  category: string;
  type: 'boolean';
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

export interface GenerateTriviaQuestionsRequest {
    amount: number; 
    type: string;
}

export interface GenerateTriviaQuestionsResponse {
  results: Question[];
}
