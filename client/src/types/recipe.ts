export interface WriterProps {
  key: string;
  name: string;
  description: string;
  profileImage: string;
}

export interface RecipeProps {
  key: string;
  title?: string;
  paragraphs?: string[];
  author?: WriterProps;
  timestamp?: string;
  category?: string;
  headImage?: string;
  images?: string[];
  shortDescription?: string;
}

