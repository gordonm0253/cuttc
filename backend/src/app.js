import express from 'express';
import cors from 'cors';
import eventsRouter from './routes/events.routes.js';
import matchesRouter from './routes/matches.routes.js';
import rankingsRouter from './routes/rankings.routes.js';
import meRouter from './routes/me.routes.js';
import playersRouter from './routes/players.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

const corsOrigins = (process.env.CORS_ORIGIN || '').split(',').map((o) => o.trim()).filter(Boolean);
app.use(cors({ origin: corsOrigins.length ? corsOrigins : true }));
app.use(express.json());

app.use('/api/events', eventsRouter);
app.use('/api/matches', matchesRouter);
app.use('/api/rankings', rankingsRouter);
app.use('/api/me', meRouter);
app.use('/api/players', playersRouter);

app.use(errorHandler);

export default app;
