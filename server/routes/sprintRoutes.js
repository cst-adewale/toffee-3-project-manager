import express from 'express';
import Issue from '../models/Issue.js';
import Sprint from '../models/Sprint.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateRequest.js';
import { createSprintSchema, sprintActionSchema } from '../schemas/sprintSchemas.js';

const router = express.Router();

async function calculateSprintMetrics(sprintId) {
  const issues = await Issue.find({ sprintId });
  const committedPoints = issues.reduce((sum, issue) => sum + (issue.storyPoints || 0), 0);
  const completedPoints = issues
    .filter((issue) => issue.status === 'done')
    .reduce((sum, issue) => sum + (issue.storyPoints || 0), 0);

  return {
    committedPoints,
    completedPoints,
    velocity: completedPoints,
  };
}

router.get('/', protect, async (req, res) => {
  const { projectId } = req.query;
  const sprints = projectId
    ? await Sprint.find({ projectId }).sort({ createdAt: -1 })
    : [];

  res.json(sprints);
});

router.post('/', protect, validateBody(createSprintSchema), async (req, res, next) => {
  try {
    const sprint = await Sprint.create({
      ...req.body,
      startDate: req.body.startDate || null,
      endDate: req.body.endDate || null,
    });

    res.status(201).json(sprint);
  } catch (error) {
    next(error);
  }
});

router.post('/:sprintId/start', protect, validateBody(sprintActionSchema), async (req, res, next) => {
  try {
    const currentSprint = await Sprint.findById(req.params.sprintId);
    if (!currentSprint) {
      return res.status(404).json({ message: 'Sprint not found.' });
    }

    await Sprint.updateMany(
      { projectId: currentSprint.projectId, status: 'active' },
      { status: 'planned' },
    );

    const metrics = await calculateSprintMetrics(req.params.sprintId);
    const sprint = await Sprint.findByIdAndUpdate(
      req.params.sprintId,
      {
        status: 'active',
        startDate: req.body.startDate || new Date(),
        metrics,
      },
      { new: true },
    );

    res.json(sprint);
  } catch (error) {
    next(error);
  }
});

router.post('/:sprintId/complete', protect, validateBody(sprintActionSchema), async (req, res, next) => {
  try {
    const metrics = await calculateSprintMetrics(req.params.sprintId);
    const sprint = await Sprint.findByIdAndUpdate(
      req.params.sprintId,
      {
        status: 'completed',
        endDate: req.body.endDate || new Date(),
        metrics,
      },
      { new: true },
    );

    res.json(sprint);
  } catch (error) {
    next(error);
  }
});

export default router;
