import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getAllDisruptions, addDisruption, removeDisruption } from '../store/disruptions.js';
import { Disruption, DisruptionType, Severity } from '../types/index.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json(getAllDisruptions());
});

router.post('/', (req: Request, res: Response) => {
  const { type, affected_route_ids, severity, description, location } = req.body as Partial<Disruption>;

  const validTypes: DisruptionType[] = ['weather', 'geopolitical', 'traffic', 'infrastructure'];
  const validSeverities: Severity[] = ['low', 'medium', 'high', 'critical'];

  if (!type || !validTypes.includes(type)) {
    res.status(400).json({ error: `type must be one of: ${validTypes.join(', ')}` });
    return;
  }
  if (!severity || !validSeverities.includes(severity)) {
    res.status(400).json({ error: `severity must be one of: ${validSeverities.join(', ')}` });
    return;
  }
  if (!Array.isArray(affected_route_ids) || affected_route_ids.length === 0) {
    res.status(400).json({ error: 'affected_route_ids must be a non-empty array' });
    return;
  }
  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    res.status(400).json({ error: 'description is required' });
    return;
  }

  const disruption: Disruption = {
    id: uuidv4(),
    type,
    affected_route_ids,
    severity,
    description: description.trim(),
    location,
    created_at: new Date().toISOString(),
  };

  addDisruption(disruption);
  res.status(201).json(disruption);
});

router.delete('/:id', (req: Request, res: Response) => {
  const removed = removeDisruption(req.params.id);
  if (!removed) {
    res.status(404).json({ error: 'Disruption not found' });
    return;
  }
  res.json({ success: true });
});

export default router;
