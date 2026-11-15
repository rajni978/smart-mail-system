import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import MailLayout from '../components/MailLayout.jsx';
import './Compose.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Compose = () => {
  const navigate = useNavigate();
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const validate = () => {
    if (!recipientEmail.trim() || !subject.trim() || !body.trim()) {
      return 'All fields are required.';
    }
    if (!EMAIL_REGEX.test(recipientEmail.trim())) {
      return 'Please enter a valid recipient email address.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setSuccess(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await api('/api/emails', {
        method: 'POST',
        body: JSON.stringify({
          recipientEmail: recipientEmail.trim(),
          subject: subject.trim(),
          body: body.trim(),
        }),
      });
      setSuccess('Email sent successfully.');
      setTimeout(() => navigate('/sent'), 600);
    } catch (err) {
      setError(err.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MailLayout>
      <div className="compose-container">
        <div className="compose-header">
          <h1 className="compose-title">New Message</h1>
          <p className="compose-subtitle">Compose and send an email</p>
        </div>

        <form className="compose-form" onSubmit={handleSubmit} noValidate>
          <div className="compose-form-header">
            <span>Compose</span>
          </div>

          {error && <div className="compose-alert compose-alert-error">{error}</div>}
          {success && <div className="compose-alert compose-alert-success">{success}</div>}

          <div className="compose-field">
            <label className="compose-label" htmlFor="recipientEmail">To</label>
            <input
              id="recipientEmail"
              type="email"
              className="compose-input"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="recipient@example.com"
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="compose-field">
            <label className="compose-label" htmlFor="subject">Subject</label>
            <input
              id="subject"
              type="text"
              className="compose-input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              disabled={loading}
            />
          </div>

          <div className="compose-field compose-field-body">
            <label className="compose-label" htmlFor="body">Message</label>
            <textarea
              id="body"
              className="compose-textarea"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message..."
              rows={14}
              disabled={loading}
            />
          </div>

          <div className="compose-actions">
            <button type="button" className="compose-discard" onClick={() => navigate(-1)} disabled={loading}>
              Discard
            </button>
            <button type="submit" className="compose-send" disabled={loading}>
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </MailLayout>
  );
};

export default Compose;
