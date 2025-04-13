import mongoose, { Schema } from 'mongoose';

const ArticleSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  authorId: { type: Schema.Types.ObjectId, ref: 'Writer', required: true },
  category: { 
    type: String, 
    enum: ['politics', 'technology', 'entertainment', 'business', 'sports'],
    required: true
  },
  status: { 
    type: String, 
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: { type: Date },
  relatedArticles: [{ type: Schema.Types.ObjectId, ref: 'Article' }],
  metadata: {
    wordCount: Number,
    sentimentScore: Number,
    generatedBy: { type: String, enum: ['openai', 'deepseek'] }
  }
}, { timestamps: true });

export const Article = mongoose.model('Article', ArticleSchema);
