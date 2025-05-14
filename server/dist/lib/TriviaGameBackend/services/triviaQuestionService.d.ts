import { Question, GenerateTriviaQuestionsRequest } from "../types/triviaGame";
export declare function fetchTriviaQuestions({ amount, type }: GenerateTriviaQuestionsRequest): Promise<Question[]>;
