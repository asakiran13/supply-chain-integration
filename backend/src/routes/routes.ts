import { Router } from 'express';
import { shippingRoutes, MAJOR_PORTS } from '../data/routes.js';
import { getDisruptionsForRoute, getAllDisruptions } from '../store/disruptions.js';
import { Severity } from '../types/index.js';

const router = Router();

const SEVERITY_ORDER: Record<string, number> = { none: 0, low: 1, medium: 2, high: 3, critical: 4 };

router.get('/', (_req, res) => {
  const allDisruptions = getAllDisruptions();

  const routesWithStatus = shippingRoutes.map((route) => {
    const disruptions = getDisruptionsForRoute(route.id);
    let maxSev: Severity | 'none' = 'none';
    disruptions.forEach((d) => {
      if (SEVERITY_ORDER[d.severity] > SEVERITY_ORDER[maxSev]) {
        maxSev = d.severity;
      }
    });
    return { ...route, disruptions, max_severity: maxSev };
  });

  res.json({ routes: routesWithStatus, ports: MAJOR_PORTS });
});

export default router;
