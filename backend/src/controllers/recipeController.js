import { Book } from '../models/Book.js';
import { Recipe } from '../models/Recipe.js';
import { hasBookEditAccess, hasBookViewAccess } from '../utils/access.js';

const normalizeRecipe = (recipe) => ({
  id: recipe._id,
  bookId: recipe.bookId?._id || recipe.bookId,
  creatorId: recipe.creatorId?._id || recipe.creatorId,
  creatorNickname: recipe.creatorId?.nickname || '',
  name: recipe.name,
  type: recipe.type,
  ingredients: recipe.ingredients,
  instructions: recipe.instructions,
  link: recipe.link,
  description: recipe.description,
  pictureURL: recipe.pictureURL,
  createdAt: recipe.createdAt,
  updatedAt: recipe.updatedAt,
});

export const createRecipe = async (req, res) => {
  try {
    const { bookId } = req.params;
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (!hasBookEditAccess(book, req.user._id)) return res.status(403).json({ message: 'Not authorized' });

    const { name, type, ingredients, instructions, link, description, pictureURL } = req.body;
    if (!name?.trim() || !type) return res.status(400).json({ message: 'Name and type are required' });

    const recipe = await Recipe.create({
      bookId: book._id,
      creatorId: req.user._id,
      name: name.trim(),
      type,
      ingredients: Array.isArray(ingredients) ? ingredients : [],
      instructions: instructions || '',
      link: link || '',
      description: description || '',
      pictureURL: pictureURL || '',
    });

    book.recipes.push(recipe._id);
    await book.save();
    await recipe.populate('creatorId', 'nickname');

    res.status(201).json(normalizeRecipe(recipe));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('creatorId', 'nickname')
      .populate('bookId');
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    if (!hasBookViewAccess(recipe.bookId, req.user?._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(normalizeRecipe(recipe));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate('bookId');
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    if (!hasBookEditAccess(recipe.bookId, req.user._id)) return res.status(403).json({ message: 'Not authorized' });

    const { name, type, ingredients, instructions, link, description, pictureURL } = req.body;
    if (typeof name === 'string' && name.trim()) recipe.name = name.trim();
    if (type === 'regular' || type === 'link') recipe.type = type;
    if (Array.isArray(ingredients)) recipe.ingredients = ingredients;
    if (typeof instructions === 'string') recipe.instructions = instructions;
    if (typeof link === 'string') recipe.link = link;
    if (typeof description === 'string') recipe.description = description;
    if (typeof pictureURL === 'string') recipe.pictureURL = pictureURL;

    await recipe.save();
    await recipe.populate('creatorId', 'nickname');
    res.json(normalizeRecipe(recipe));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
