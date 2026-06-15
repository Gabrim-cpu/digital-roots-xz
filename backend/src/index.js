import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import { testConnection } from './config/database.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    architecture: 'PostgreSQL + Firebase',
    project: 'Digital Roots (XZ)',
    database: process.env.DB_NAME,
    timestamp: new Date()
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log('======================================================');
  console.log(`🚀 XZ Node.js Core Backend executing on port ${PORT}`);
  console.log(`📂 Connected to Firebase Project: ${process.env.FIREBASE_PROJECT_ID || 'not configured'}`);
  console.log('======================================================');
  await testConnection();
});