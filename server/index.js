import http from 'http';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import emailRoutes from './routes/emailRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB before starting the server
await connectDB();

const app = express();
const httpServer = http.createServer(app);

const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';

const io = new Server(httpServer, {
  cors: {
    origin: frontendOrigin,
    credentials: true,
  },
});

io.use((socket, next) => {
  try {
    const authToken = socket.handshake.auth?.token;
    const header = socket.handshake.headers?.authorization;
    const headerToken = typeof header === 'string' && header.startsWith('Bearer ')
      ? header.split(' ')[1]
      : null;
    const token = authToken || headerToken;

    if (!token) {
      return next(new Error('Not authorized, no token'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded?.id;
    if (!userId) {
      return next(new Error('Not authorized, token invalid'));
    }

    socket.data.userId = String(userId);
    return next();
  } catch (err) {
    return next(new Error('Not authorized, token failed'));
  }
});

io.on('connection', (socket) => {
  const room = `user:${socket.data.userId}`;
  socket.join(room);
});

app.set('io', io);

// Body parser middleware
app.use(express.json());

// CORS middleware
app.use(
  cors({
    origin: frontendOrigin,
    credentials: true,
  })
);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/emails', emailRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Smart Mail API is running');
});

// Global JSON error-handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  const isProduction = process.env.NODE_ENV === 'production';
  const message =
    isProduction && statusCode >= 500
      ? 'Server Error'
      : err.message || 'Server Error';

  res.status(statusCode).json({
    message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
