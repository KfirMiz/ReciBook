import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

const sanitizeUser = (user) => ({
  id: user._id,
  username: user.username,
  nickname: user.nickname,
  pictureURL: user.pictureURL,
  createdAt: user.createdAt,
});

export const register = async (req, res) => {
  try {
    const { username, password, nickname, pictureURL } = req.body;

    if (!username || !password || !nickname) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const existing = await User.findOne({
      $or: [{ username: username.toLowerCase().trim() }, { nickname: nickname.trim() }],
    });
    if (existing) return res.status(400).json({ message: 'Invalid / already existing credentials' });

    const user = await User.create({
      username: username.toLowerCase().trim(),
      password,
      nickname: nickname.trim(),
      pictureURL: pictureURL || undefined,
    });

    const token = generateToken(user._id);

    res.status(201).json({ user: sanitizeUser(user), token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: (username || '').toLowerCase().trim() });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user._id);

    res.json({ user: sanitizeUser(user), token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
