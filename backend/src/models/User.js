import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: (value) => value.length >= 6,
      message: 'Password must be at least 6 characters.',
    },
  },
  nickname: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  pictureURL: {
    type: String,
    default: process.env.DEFAULT_AVATAR_URL || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
  },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export const User = mongoose.model('User', userSchema);
