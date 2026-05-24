import express from 'express';
import Project from '../models/Project.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateRequest.js';
import { createProjectSchema } from '../schemas/projectSchemas.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  const projects = await Project.find({
    $or: [
      { owner: req.user.userId },
      { 'members.user': req.user.userId },
    ],
  }).sort({ createdAt: 1 });

  res.json(projects);
});

router.post('/', protect, validateBody(createProjectSchema), async (req, res, next) => {
  try {
    const project = await Project.create({
      name: req.body.name,
      key: req.body.key,
      owner: req.user.userId,
      members: [{ user: req.user.userId, role: 'Manager' }],
    });

    res.status(201).json(project);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Project key already exists.' });
    }

    next(error);
  }
});

export default router;
