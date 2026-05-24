import express from 'express';
import Project from '../models/Project.js';
import Issue from '../models/Issue.js';
import Comment from '../models/Comment.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateRequest.js';
import { issueRepository } from '../repositories/issueRepository.js';
import { issueEventRepository } from '../repositories/issueEventRepository.js';
import {
  addCommentSchema,
  assignIssueSchema,
  assignIssueSprintSchema,
  createIssueSchema,
  transitionIssueSchema,
  updateIssueDatesSchema,
  updateEstimateSchema,
} from '../schemas/issueSchemas.js';
import {
  assignIssue,
  createIssue,
  transitionIssue,
  updateEstimate,
} from '../services/workflowService.js';
import { addComment } from '../services/commentService.js';
import multer from 'multer';
import path from 'path';

const upload = multer({ dest: 'server/uploads/' });

const router = express.Router();

async function nextIssueKey(projectId) {
  const project = await Project.findById(projectId);
  if (!project) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    throw error;
  }

  const existingCount = await Issue.countDocuments({ projectId });

  return `${project.key}-${existingCount + 1}`;
}

router.get('/', protect, async (req, res) => {
  const { projectId } = req.query;
  const issues = projectId
    ? await issueRepository.findByProject(projectId)
    : [];

  res.json(issues);
});

router.post('/', protect, validateBody(createIssueSchema), async (req, res, next) => {
  try {
    const issueKey = req.body.issueKey || await nextIssueKey(req.body.projectId);
    const issue = await createIssue({
      ...req.body,
      issueKey,
      reporterId: req.user.userId,
    });

    res.status(201).json(issue);
  } catch (error) {
    next(error);
  }
});

router.post('/:issueId/transitions', protect, validateBody(transitionIssueSchema), async (req, res, next) => {
  try {
    const issue = await transitionIssue({
      issueId: req.params.issueId,
      userId: req.user.userId,
      targetStateId: req.body.targetStateId,
      user: req.user,
    });

    res.json(issue);
  } catch (error) {
    next(error);
  }
});

router.patch('/:issueId/assignee', protect, validateBody(assignIssueSchema), async (req, res, next) => {
  try {
    const issue = await assignIssue({
      issueId: req.params.issueId,
      userId: req.user.userId,
      assigneeId: req.body.assigneeId,
    });

    res.json(issue);
  } catch (error) {
    next(error);
  }
});

router.patch('/:issueId/estimate', protect, validateBody(updateEstimateSchema), async (req, res, next) => {
  try {
    const issue = await updateEstimate({
      issueId: req.params.issueId,
      userId: req.user.userId,
      estimate: req.body.estimate,
      storyPoints: req.body.storyPoints,
    });

    res.json(issue);
  } catch (error) {
    next(error);
  }
});

router.patch('/:issueId/sprint', protect, validateBody(assignIssueSprintSchema), async (req, res, next) => {
  try {
    const issue = await Issue.findByIdAndUpdate(
      req.params.issueId,
      { sprintId: req.body.sprintId },
      { new: true },
    );

    res.json(issue);
  } catch (error) {
    next(error);
  }
});

router.patch('/:issueId/dates', protect, validateBody(updateIssueDatesSchema), async (req, res, next) => {
  try {
    const issue = await Issue.findByIdAndUpdate(
      req.params.issueId,
      { dueDate: req.body.dueDate || null },
      { new: true },
    );

    res.json(issue);
  } catch (error) {
    next(error);
  }
});

router.post('/:issueId/comments', protect, validateBody(addCommentSchema), async (req, res, next) => {
  try {
    const comment = await addComment({
      issueId: req.params.issueId,
      userId: req.user.userId,
      body: req.body.body,
    });

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
});

router.get('/:issueId/events', protect, async (req, res) => {
  const events = await issueEventRepository.findByIssue(req.params.issueId);
  res.json(events);
});

router.get('/:issueId/comments', protect, async (req, res) => {
  const comments = await Comment.find({ issueId: req.params.issueId })
    .sort({ createdAt: 1 })
    .populate('authorId', 'name email');

  res.json(comments);
});

router.post('/:issueId/attachments', protect, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const issue = await Issue.findById(req.params.issueId);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const attachment = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    };

    issue.attachments.push(attachment);
    await issue.save();

    res.status(201).json(issue);
  } catch (error) {
    next(error);
  }
});

export default router;
