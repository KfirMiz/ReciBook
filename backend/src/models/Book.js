import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  pictureURL: {
    type: String,
    default: '',
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'private',
    index: true,
  },
  recipes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
  }],
  editors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  viewers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, { timestamps: true });

bookSchema.index({ ownerId: 1, createdAt: -1 });
bookSchema.index({ name: 'text' });

export const Book = mongoose.model('Book', bookSchema);
