import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // frontend URL
  credentials: true, // allow cookies or auth headers if needed
}));

app.use(express.json());

app.get('/health', (req, res) => res.status(200).send('OK'));
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api', recipeRoutes);

app.get('/', (_req, res) => res.send('ReciBook API is running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

