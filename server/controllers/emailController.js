import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Email from '../models/Email.js';
import User from '../models/User.js';
import { sendSmtpEmail, isSmtpConfigured } from '../utils/mailer.js';

// @desc    Send an email
// @route   POST /api/emails
// @access  Private
export const sendEmail = asyncHandler(async (req, res) => {
  const { recipientEmail, subject, body } = req.body;

  if (
    typeof recipientEmail !== 'string' ||
    typeof subject !== 'string' ||
    typeof body !== 'string'
  ) {
    res.status(400);
    throw new Error('Invalid request data');
  }

  const normalizedRecipientEmail = recipientEmail.toLowerCase().trim();
  const trimmedSubject = subject.trim();
  const trimmedBody = body.trim();

  // Validate required fields
  if (!normalizedRecipientEmail || !trimmedSubject || !trimmedBody) {
    res.status(400);
    throw new Error('Please enter all fields');
  }

  // Find and verify that the recipient exists (emails are stored lowercase/trimmed)
  const recipient = await User.findOne({
    email: normalizedRecipientEmail,
  });

  if (!recipient) {
    res.status(404);
    throw new Error('Recipient not found');
  }

  // Save the email; sender comes from the authenticated user, isRead defaults to false
  const email = await Email.create({
    sender: req.user._id,
    recipient: recipient._id,
    subject: trimmedSubject,
    body: trimmedBody,
  });

  const io = req.app.get('io');
  if (io) {
    const payload = {
      _id: email._id,
      sender: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
      },
      recipient: {
        _id: recipient._id,
        name: recipient.name,
        email: recipient.email,
      },
      subject: email.subject,
      body: email.body,
      isRead: email.isRead,
      createdAt: email.createdAt,
      updatedAt: email.updatedAt,
    };
    io.to(`user:${recipient._id.toString()}`).emit('email:new', payload);
  }

  if (isSmtpConfigured()) {
    try {
      await sendSmtpEmail({
        to: recipient.email,
        subject: email.subject,
        text: email.body,
      });
    } catch (error) {
      console.error('SMTP delivery failed for email:', email._id.toString());
    }
  }

  res.status(201).json(email);
});

// @desc    Get inbox emails (received by the authenticated user)
// @route   GET /api/emails/inbox
// @access  Private
export const getInbox = asyncHandler(async (req, res) => {
  const emails = await Email.find({ recipient: req.user._id })
    .populate('sender', '-password')
    .sort({ createdAt: -1 });

  res.json(emails);
});

// @desc    Get sent emails (sent by the authenticated user)
// @route   GET /api/emails/sent
// @access  Private
export const getSentEmails = asyncHandler(async (req, res) => {
  const emails = await Email.find({ sender: req.user._id })
    .populate('recipient', '-password')
    .sort({ createdAt: -1 });

  res.json(emails);
});

// @desc    Get a single email by ID
// @route   GET /api/emails/:id
// @access  Private
export const getEmailById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isObjectIdOrHexString(id)) {
    res.status(400);
    throw new Error('Invalid email ID');
  }

  const email = await Email.findById(id)
    .populate('sender', '-password')
    .populate('recipient', '-password');

  if (!email) {
    res.status(404);
    throw new Error('Email not found');
  }

  // Allow access only if the authenticated user is the sender or recipient
  if (
    email.sender._id.toString() !== req.user._id.toString() &&
    email.recipient._id.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error('Not authorized to access this email');
  }

  res.json(email);
});

// @desc    Get unread email count for authenticated recipient
// @route   GET /api/emails/unread-count
// @access  Private
export const getUnreadCount = asyncHandler(async (req, res) => {
  const unreadCount = await Email.countDocuments({
    recipient: req.user._id,
    isRead: false,
  });

  res.json({ unreadCount });
});

// @desc    Mark an email as read
// @route   PUT /api/emails/:id/read
// @access  Private
export const markEmailAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isObjectIdOrHexString(id)) {
    res.status(400);
    throw new Error('Invalid email ID');
  }

  const email = await Email.findById(id);

  if (!email) {
    res.status(404);
    throw new Error('Email not found');
  }

  // Allow only the recipient to mark the email as read
  if (email.recipient.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to mark this email as read');
  }

  email.isRead = true;
  await email.save();

  res.json({ message: 'Email marked as read', email });
});
