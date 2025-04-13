import mongoose, { Schema } from 'mongoose';

const WriterSchema = new Schema({
  name: { type: String, required: true },
  bio: String,
  specialties: [{
    type: String,
    enum: ['breaking-news', 'opinion', 'investigative', 'satire']
  }],
  status: {
    type: String,
    enum: ['active', 'on-leave', 'retired'],
    default: 'active'
  },
  relationships: [{
    colleague: { type: Schema.Types.ObjectId, ref: 'Writer' },
    relationshipType: {
      type: String,
      enum: ['mentor', 'rival', 'collaborator']
    },
    strength: { type: Number, min: 0, max: 100 }
  }],
  generatedContentHistory: [{
    type: Schema.Types.ObjectId,
    ref: 'Article'
  }]
}, { timestamps: true });

export const Writer = mongoose.model('Writer', WriterSchema);
