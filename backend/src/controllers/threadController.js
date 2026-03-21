import { Thread } from '../models/Thread.js';

// Create a new thread
export const createThread = async (req, res) => {
  try {
    const thread = new Thread({
      ...req.body,
      userId: req.user._id, // Attach the logged-in user's id
    });
    await thread.save();

    // Populate username and pictureUrl before sending
    await thread.populate('userId', 'username pictureUrl');

    res.status(201).json(thread);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all threads
export const getThreads = async (req, res) => {
  try {
    const threads = await Thread.find()
      .sort({ creationTime: -1 })
      .populate('userId', 'username pictureUrl'); // populate username + pictureUrl
    res.json(threads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single thread by id
export const getThreadById = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id)
      .populate('userId', 'username pictureUrl');
    if (!thread) return res.status(404).json({ message: 'Thread not found' });
    res.json(thread);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update thread
export const updateThread = async (req, res) => {
  try {
    const { id } = req.params;
    const thread = await Thread.findById(id);
    if (!thread) return res.status(404).json({ message: 'Thread not found' });

    if (req.user.role !== 'admin' && req.user._id.toString() !== thread.userId.toString())
      return res.status(403).json({ message: 'Not authorized' });

    const { description, pictureUrl } = req.body;
    if (description) thread.description = description;
    if (pictureUrl) thread.pictureUrl = pictureUrl;

    await thread.save();
    await thread.populate('userId', 'username pictureUrl');
    res.json(thread);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete thread
export const deleteThread = async (req, res) => {
  try {
    const { id } = req.params;
    const thread = await Thread.findById(id);
    if (!thread) return res.status(404).json({ message: 'Thread not found' });

    if (req.user.role !== 'admin' && req.user._id.toString() !== thread.userId.toString())
      return res.status(403).json({ message: 'Not authorized' });

    await Thread.findByIdAndDelete(id);
    res.json({ message: 'Thread deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
