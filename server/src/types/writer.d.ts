interface Writer {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}