import mongoose from 'mongoose';
import { Book } from '../models/Book.js';
import { Recipe } from '../models/Recipe.js';
import { User } from '../models/User.js';
import { getAccessLevel, hasBookEditAccess, hasBookViewAccess } from '../utils/access.js';

const normalizeBook = (book, userId) => ({
  id: book._id,
  ownerId: book.ownerId,
  name: book.name,
  pictureURL: book.pictureURL,
  visibility: book.visibility,
  recipes: book.recipes,
  editors: book.editors,
  viewers: book.viewers,
  createdAt: book.createdAt,
  updatedAt: book.updatedAt,
  accessLevel: getAccessLevel(book, userId),
});

export const getBooks = async (req, res) => {
  try {
    const userId = req.user?._id ? String(req.user._id) : null;
    const filters = [{ visibility: 'public' }];
    if (userId) {
      const objectId = new mongoose.Types.ObjectId(userId);
      filters.push({ ownerId: objectId }, { editors: objectId }, { viewers: objectId });
    }
    const books = await Book.find({ $or: filters }).sort({ createdAt: -1 });
    res.json(books.map((book) => normalizeBook(book, userId)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createBook = async (req, res) => {
  try {
    const { name, pictureURL, visibility } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Book name is required' });
    const book = await Book.create({
      ownerId: req.user._id,
      name: name.trim(),
      pictureURL: pictureURL || '',
      visibility: visibility === 'public' ? 'public' : 'private',
      editors: [],
      viewers: [],
      recipes: [],
    });
    res.status(201).json(normalizeBook(book, req.user._id));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getBookById = async (req, res) => {
  try {
    // Change this line:
    // const book = await Book.findById(req.params.id);
    
    // To this:
    const book = await Book.findById(req.params.id)
      .populate('ownerId', 'nickname pictureURL')
      .populate('editors', 'nickname pictureURL')
      .populate('viewers', 'nickname pictureURL');

    if (!book) return res.status(404).json({ message: 'Book not found' });
    const userId = req.user?._id;
    if (!hasBookViewAccess(book, userId)) return res.status(403).json({ message: 'Not authorized' });
    res.json(normalizeBook(book, userId));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    const userId = req.user._id;
    const isOwner = String(book.ownerId) === String(userId);
    if (!hasBookEditAccess(book, userId)) return res.status(403).json({ message: 'Not authorized' });

    const { name, pictureURL, visibility } = req.body;
    if (typeof name === 'string' && name.trim()) book.name = name.trim();
    if (typeof pictureURL === 'string') book.pictureURL = pictureURL;
    if (isOwner && (visibility === 'public' || visibility === 'private')) {
      book.visibility = visibility;
    }

    await book.save();
    res.json(normalizeBook(book, userId));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const shareBook = async (req, res) => {
  try {
    const { nickname, role } = req.body;
    if (!nickname || !role) return res.status(400).json({ message: 'Nickname and role are required' });
    //if (!['editor', 'viewer'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
    if (!['editor', 'viewer', 'remove'].includes(role)) return res.status(400).json({ message: 'Invalid role' });

    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (String(book.ownerId) !== String(req.user._id)) return res.status(403).json({ message: 'Only owner can share' });

    const targetUser = await User.findOne({ nickname: nickname.trim() });
    if (!targetUser) return res.status(404).json({ message: 'User not found' });
    if (String(targetUser._id) === String(book.ownerId)) {
      return res.status(400).json({ message: 'Owner already has full access' });
    }

    const targetId = String(targetUser._id);
    book.editors = book.editors.filter((id) => String(id) !== targetId);
    book.viewers = book.viewers.filter((id) => String(id) !== targetId);
    if (role === 'editor') book.editors.push(targetUser._id);
    if (role === 'viewer') book.viewers.push(targetUser._id);

    await book.save();
    res.json({
      message: 'Book shared successfully',
      book: normalizeBook(book, req.user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getBookRecipes = async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (!hasBookViewAccess(book, req.user?._id)) return res.status(403).json({ message: 'Not authorized' });

    const q = (req.query.q || '').trim();
    const filter = { bookId: book._id };
    if (q) filter.name = { $regex: q, $options: 'i' };

    const recipes = await Recipe.find(filter)
      .populate('creatorId', 'nickname pictureURL') // <-- Added pictureURL
      .sort({ createdAt: -1 });
    res.json(recipes.map((recipe) => ({
      id: recipe._id,
      bookId: recipe.bookId,
      creatorId: recipe.creatorId?._id || recipe.creatorId,
      creatorNickname: recipe.creatorId?.nickname || '',
      creatorAvatar: recipe.creatorId?.pictureURL || '', // <-- Added this exact line!
      name: recipe.name,
      type: recipe.type,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      link: recipe.link,
      description: recipe.description,
      pictureURL: recipe.pictureURL,
      createdAt: recipe.createdAt,
      updatedAt: recipe.updatedAt,
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
