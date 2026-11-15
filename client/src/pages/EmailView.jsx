import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import MailLayout from '../components/MailLayout.jsx';
import VoiceAssistant from '../components/VoiceAssistant.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import './EmailView.css';

const getId = (val) => {
  if (!val) return null;
  if (typeof val === 'string') return val;
  return val._id || val.id || null;
};

const EmailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchEmail = async () => {
      if (!id) {
        setError('Invalid email ID.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await api(`/api/emails/${id}`);
        if (cancelled) return;
        setEmail(data);

        const currentUserId = user?._id || user?.id;
        const recipientId = getId(data.recipient);
        const isRecipient = currentUserId && recipientId && String(currentUserId) === String(recipientId);

        if (isRecipient && data.isRead === false) {
          try {
            await api(`/api/emails/${id}/read`, { method: 'PUT' });
            if (!cancelled) {
              setEmail((prev) => (prev ? { ...prev, isRead: true } : prev));
              window.dispatchEvent(new CustomEvent('smartmail:email:read', { detail: { id } }));
            }
          } catch {
            // Non-blocking: email is still viewable even if marking as read fails
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load email');
          setEmail(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchEmail();
    return () => {
      cancelled = true;
    };
  }, [id, user]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/inbox');
    }
  };

  const initials = (name) => (name || '?').trim().charAt(0).toUpperCase();

  if (loading) {
    return (
      <MailLayout>
        <div className="email-view-status">Loading email...</div>
      </MailLayout>
    );
  }

  if (error || !email) {
    return (
      <MailLayout>
        <div className="email-view-status email-view-error">
          <h2>Unable to open email</h2>
          <p>{error || 'Invalid email.'}</p>
          <button type="button" className="email-view-back-btn" onClick={handleBack}>
            Back
          </button>
        </div>
      </MailLayout>
    );
  }

  const sender = email.sender || {};
  const recipient = email.recipient || {};

  return (
    <MailLayout>
      <div className="email-view-container">
        <div className="email-view-toolbar">
          <button type="button" className="email-view-back-btn" onClick={handleBack}>
            ← Back
          </button>
        </div>

        <article className="email-view-card">
          <header className="email-view-header">
            <h1 className="email-view-subject">{email.subject || '(No subject)'}</h1>

            <div className="email-view-parties">
              <div className="party-avatar">{initials(sender.name)}</div>
              <div className="party-details">
                <div className="party-row">
                  <span className="party-name">{sender.name || 'Unknown sender'}</span>
                  {sender.email && <span className="party-email">&lt;{sender.email}&gt;</span>}
                </div>
                <div className="party-row secondary">
                  <span className="party-label">To:</span>
                  <span className="party-to">
                    {recipient.name || 'Unknown recipient'}
                    {recipient.email ? ` <${recipient.email}>` : ''}
                  </span>
                </div>
              </div>
              <div className="party-date">{formatDate(email.createdAt || email.updatedAt)}</div>
            </div>
          </header>

          <div className="email-view-assistant">
            <VoiceAssistant
              subject={email.subject || ''}
              senderName={sender.name || ''}
              body={email.body || ''}
              emailId={email._id || id}
            />
          </div>

          <div className="email-view-body">{email.body || ''}</div>
        </article>
      </div>
    </MailLayout>
  );
};

export default EmailView;
