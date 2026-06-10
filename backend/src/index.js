import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';

// Load our system keys
dotenv.config();

const app = express();

// Middlewares
app.use(cors()); // Permits your frontend to talk to this backend
app.use(express.json()); // Allows the backend to process input fields securely

// Mount your independent API routes
app.use('/api/auth', authRoutes);

// B-TECH Defense Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    architecture: 'Hybrid Node.js + Firebase BaaS',
    project: 'Digital Roots (XZ)',
    timestamp: new Date()
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('======================================================');
  console.log(` 🚀 XZ Node.js Core Backend executing on port ${PORT}`);
  console.log(` 📂 Connected to Firebase Project: xz-bridging-generational-aac96`);
  console.log('======================================================');
});