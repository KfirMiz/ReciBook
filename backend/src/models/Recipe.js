import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
    index: true,
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['regular', 'link'],
    required: true,
  },
  ingredients: [{ type: String }],
  instructions: { type: String, default: '' },
  link: { type: String, default: '' },
  description: { type: String, default: '' },
  pictureURL: { type: String, default: '' },
}, { timestamps: true });

recipeSchema.pre('validate', function (next) {
  if (this.type === 'regular') {
    if (!this.instructions || !this.instructions.trim()) {
      return next(new Error('Regular recipe must include instructions.'));
    }
  }
  if (this.type === 'link') {
    if (!this.link || !this.link.trim()) {
      return next(new Error('Link recipe must include link.'));
    }
  }
  next();
});

export const Recipe = mongoose.model('Recipe', recipeSchema);
