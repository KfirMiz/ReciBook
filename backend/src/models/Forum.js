import mongoose from 'mongoose';

const forumSchema = new mongoose.Schema({
  creatorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  description: { type: String },
  forumPic: { type: String },
  creationTime: { type: Date, default: Date.now }
});

export const Forum = mongoose.model('Forum', forumSchema);
