import { User } from '../models/User.js';
import bcrypt from 'bcrypt';

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('username nickname pictureURL createdAt');
    res.json(users.map((user) => ({
      id: user._id,
      username: user.username,
      nickname: user.nickname,
      pictureURL: user.pictureURL,
      createdAt: user.createdAt,
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('username nickname pictureURL createdAt');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      id: user._id,
      username: user.username,
      nickname: user.nickname,
      pictureURL: user.pictureURL,
      createdAt: user.createdAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (String(req.user._id) !== String(id)) return res.status(403).json({ message: 'Not authorized' });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { nickname, password, currentPassword, pictureURL } = req.body;

    if (nickname && nickname.trim() !== user.nickname) {
      const existingNickname = await User.findOne({ nickname: nickname.trim() });
      if (existingNickname) return res.status(400).json({ message: 'Nickname already exists' });
      user.nickname = nickname.trim();
    }

    if (password) {
      if (!currentPassword) return res.status(400).json({ message: 'Current password is required' });
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) return res.status(400).json({ message: 'Current password is incorrect' });

      if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

      user.password = password;
    }

    if (typeof pictureURL === 'string' && pictureURL.trim()) user.pictureURL = pictureURL;

    await user.save();

    res.json({
      id: user._id,
      username: user.username,
      nickname: user.nickname,
      pictureURL: user.pictureURL,
      createdAt: user.createdAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (String(req.user._id) !== String(id)) return res.status(403).json({ message: 'Not authorized' });

    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
