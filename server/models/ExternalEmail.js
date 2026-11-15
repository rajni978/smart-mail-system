import mongoose from 'mongoose';

const externalEmailSchema = new mongoose.Schema(
  {
    mailbox: {
      type: String,
      required: [true, 'Please add a mailbox'],
      trim: true,
      lowercase: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please add a recipient'],
    },
    sender: {
      name: {
        type: String,
        trim: true,
        default: '',
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
        default: '',
      },
    },
    subject: {
      type: String,
      trim: true,
      default: '',
    },
    body: {
      type: String,
      default: '',
    },
    messageId: {
      type: String,
      trim: true,
    },
    uid: {
      type: Number,
      required: [true, 'Please add a UID'],
    },
    uidValidity: {
      type: Number,
      required: [true, 'Please add a UIDVALIDITY value'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    receivedAt: {
      type: Date,
      required: [true, 'Please add the received date'],
    },
  },
  {
    timestamps: true,
  }
);

externalEmailSchema.index({ mailbox: 1, uidValidity: 1, uid: 1 }, { unique: true });

const ExternalEmail = mongoose.model('ExternalEmail', externalEmailSchema);

export default ExternalEmail;
