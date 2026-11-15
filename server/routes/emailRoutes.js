import express from 'express';
import {
  sendEmail,
  getInbox,
  getSentEmails,
  getEmailById,
  markEmailAsRead,
  getUnreadCount,
} from '../controllers/emailController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Send an email (authenticated sender)
router.post('/', protect, sendEmail);

// Get inbox emails (received by authenticated user)
router.get('/inbox', protect, getInbox);

// Get sent emails (sent by authenticated user)
router.get('/sent', protect, getSentEmails);

// Get unread email count for authenticated user
router.get('/unread-count', protect, getUnreadCount);

// Get a single email by ID
router.get('/:id', protect, getEmailById);

// Mark an email as read
router.put('/:id/read', protect, markEmailAsRead);

export default router;
