import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

console.log('Loading environment variables...');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });
console.log('MONGODB_URI:', process.env.MONGODB_URI);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://teja-0504.github.io', 
        'https://excel-xz7q.onrender.com',
        'https://glowing-fiesta-wr5g94vv7wxx254jg-5174.app.github.dev',
        /^https:\/\/.*\.app\.github\.dev$/,
        /^https:\/\/.*\.preview\.app\.github\.dev$/
      ] 
    : [
        'http://localhost:3000', 
        'http://localhost:5173',
        'http://localhost:5174',
        'https://glowing-fiesta-wr5g94vv7wxx254jg-5174.app.github.dev',
        /^https:\/\/.*\.app\.github\.dev$/,
        /^https:\/\/.*\.preview\.app\.github\.dev$/
      ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Basic route
app.get('/', (req, res) => {
  res.send('Excel Analytics Platform Backend is running');
});

import authRoutes from './routes/auth.js';

import uploadRoutes from './routes/upload.js';
import adminRoutes from './routes/admin.js';
import chartRoutes from './routes/chart.js';
import userSettingsRoutes from './routes/userSettings.js';

// Add routes for auth, upload, admin, chart, userSettings etc.

app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chart', chartRoutes);
app.use('/api/user-settings', userSettingsRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
