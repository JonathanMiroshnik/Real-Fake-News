// TODO: add unique ID for each player?
export interface Player {
  name: string;
  score: number;
}

export enum QuestionOrigins {
  PublicDatabase,
  LLM,
}
