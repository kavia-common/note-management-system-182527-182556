import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { notesRouter } from './routes/notes.js';
import { errorHandler, notFoundHandler } from './utils/errorHandler.js';
import { getConfig } from './utils/config.js';

const app = express();
const cfg = getConfig();

// Middleware
app.use(helmet());
app.use(express.json());

// CORS setup
app.use(
  cors({
    origin: cfg.corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false
  })
);

// Healthcheck
// PUBLIC_INTERFACE
app.get('/health', (req, res) => {
  /** Simple health check endpoint. Returns 200 OK with service info. */
  res.json({ status: 'ok', service: 'notes_backend', version: '1.0.0' });
});

/**
 * Routes
 * Align with frontend expectation to use versioned base path: /api/v1/notes
 */
app.use('/api/v1/notes', notesRouter);

// 404 and error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const port = cfg.port;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Notes backend listening on http://localhost:${port}`);
});
