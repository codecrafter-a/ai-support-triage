import express from 'express';
import cors from 'cors';
import { initDb } from './db/index.js';
import db from './db/index.js';
import ticketRoutes from './routes/tickets.js';
import kbRoutes from './routes/kb.js';
import { errorHandler } from './middleware/errorHandler.js';
import { loadFromDb } from './ai/vector.js';
import { config } from './config/env.js';

const app = express();
const PORT = config.PORT;

app.use(cors());
app.use(express.json({ limit: config.JSON_LIMIT })); 

// Initialize database
initDb();

loadFromDb(db);

// Routes
app.use('/api/tickets', ticketRoutes);
app.use('/api/kb', kbRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
