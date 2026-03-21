import mongoose from 'mongoose';

const threadSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  forumId: { type: mongoose.Schema.Types.ObjectId, ref: 'Forum', required: true },
  description: { type: String, required: true },
  upvotesNum: { type: Number, default: 0 },
  downvotesNum: { type: Number, default: 0 },
  creationTime: { type: Date, default: Date.now }
});

export const Thread = mongoose.model('Thread', threadSchema);
