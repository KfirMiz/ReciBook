import { Forum } from '../models/Forum.js';
import { Thread } from '../models/Thread.js';

// ✅ Create Forum
export const createForum = async (req, res) => {
  try {
    const forum = new Forum({
      ...req.body,
      creatorUserId: req.user.id,
    });
    await forum.save();
    res.status(201).json(forum);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ✅ Read All
export const getForums = async (req, res) => {
  try {
    const forums = await Forum.find();
    res.json(forums);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Read One
export const getForumById = async (req, res) => {
  try {
    const forum = await Forum.findById(req.params.id);
    if (!forum) return res.status(404).json({ message: 'Forum not found' });
    res.json(forum);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Update
export const updateForum = async (req, res) => {
  try {
    const { id } = req.params;
    const forum = await Forum.findById(id);
    if (!forum) return res.status(404).json({ message: 'Forum not found' });

    // Authorization fix
    if (req.user.role !== 'admin' && req.user.id !== forum.creatorUserId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Use consistent field names
    const { topic, description, forumPic } = req.body;
    if (topic !== undefined) forum.topic = topic;
    if (description !== undefined) forum.description = description;
    if (forumPic !== undefined) forum.forumPic = forumPic;

    await forum.save();
    res.json(forum);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Delete
export const deleteForum = async (req, res) => {
  try {
    const { id } = req.params;
    const forum = await Forum.findById(id);
    if (!forum) return res.status(404).json({ message: 'Forum not found' });

    // Authorization check
    if (req.user.role !== 'admin' && req.user.id !== forum.creatorUserId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete all threads in this forum
    await Thread.deleteMany({ forumId: forum._id });

    // Delete the forum itself
    await Forum.findByIdAndDelete(id);

    res.json({ message: 'Forum and its threads deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
