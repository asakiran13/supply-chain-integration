import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routesRouter from './routes/routes.js';
import disruptionsRouter from './routes/disruptions.js';
import planRouter from './routes/plan.js';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/routes', routesRouter);
app.use('/api/disruptions', disruptionsRouter);
app.use('/api/plan', planRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`AI Supply Chain backend running on http://localhost:${PORT}`);
});
