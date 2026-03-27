import { Router, Request, Response } from 'express';
import { shippingRoutes } from '../data/routes.js';
import { getAllDisruptions } from '../store/disruptions.js';
import { orchestratorAgent } from '../agents/orchestratorAgent.js';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { origin, destination } = req.body as { origin?: string; destination?: string };

  if (!origin || typeof origin !== 'string' || origin.trim().length === 0) {
    res.status(400).json({ error: 'origin is required' });
    return;
  }
  if (!destination || typeof destination !== 'string' || destination.trim().length === 0) {
    res.status(400).json({ error: 'destination is required' });
    return;
  }

  const disruptions = getAllDisruptions();

  try {
    const recommendation = await orchestratorAgent(
      origin.trim(),
      destination.trim(),
      disruptions,
      shippingRoutes
    );
    res.json(recommendation);
  } catch (err) {
    console.error('Orchestrator error:', err);
    res.status(500).json({ error: 'Failed to compute route recommendation' });
  }
});

export default router;
