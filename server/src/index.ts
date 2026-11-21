import cors from 'cors';
import express from 'express';
import { BakanteDatabase } from './db.ts';
import { DATA_DB_PATH } from './paths.ts';
import { createApiRouter } from './routes.ts';

const PORT = Number(process.env.PORT ?? 4000);

const db = new BakanteDatabase(DATA_DB_PATH);

// Seed sample schedule automatically on first startup if empty
if (db.getBookings().length === 0) {
  db.resetToDemoSchedule();
}

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', createApiRouter(db));

app.listen(PORT, () => {
  console.log(`Bakante API listening on http://localhost:${PORT}`);
});
