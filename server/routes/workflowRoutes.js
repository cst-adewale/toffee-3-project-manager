import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { workflowRepository } from '../repositories/workflowRepository.js';
import { ensureDefaultWorkflow } from '../services/workflowSeedService.js';

const router = express.Router();

router.get('/states', protect, async (req, res) => {
  const states = await workflowRepository.listStates();
  res.json(states);
});

router.get('/transitions', protect, async (req, res) => {
  const transitions = await workflowRepository.listTransitions();
  res.json(transitions);
});

router.post('/seed-default', protect, async (req, res, next) => {
  try {
    const workflow = await ensureDefaultWorkflow();
    res.status(201).json(workflow);
  } catch (error) {
    next(error);
  }
});

export default router;
