import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api.js';
import MailLayout from '../components/MailLayout.jsx';
import './Inbox.css';

const Sent = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('q') || '').toLowerCase().trim();

  const fetchSent = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api('/api/emails/sent');
      setEmails(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load sent emails');
      setEmails([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSent();
  }, []);

  const filtered = useMemo(() => {
    if (!query) return emails;
    return emails.filter((e) => {
      const recipient = `${e.recipient?.name || ''} ${e.recipient?.email || ''}`.toLowerCase();
      const subject = (e.subject || '').toLowerCase();
      const body = (e.body || '').toLowerCase();
      return recipient.includes(query) || subject.includes(query) || body.includes(query);
    });
  }, [emails, query]);

  const handleEmailClick = (id) => {
    setSelectedId(id);
    navigate(`/email/${id}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';
    const now = new Date();
    const sameDay = date.toDateString() === now.toDateString();
    if (sameDay) return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <MailLayout>
        <div className="mail-state">Loading sent emails...</div>
      </MailLayout>
    );
  }

  if (error) {
    return (
      <MailLayout>
        <div className="mail-state mail-state-error">
          <h2>Unable to load sent emails</h2>
          <p>{error}</p>
          <button className="mail-btn-secondary" onClick={fetchSent}>Try again</button>
        </div>
      </MailLayout>
    );
  }

  return (
    <MailLayout>
      <div className="mail-page">
        <div className="mail-page-header">
          <div>
            <h1 className="mail-page-title">Sent</h1>
            <p className="mail-page-subtitle">
              {query ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${searchParams.get('q')}"` : `${emails.length} message${emails.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="mail-state">
            <h2>{query ? 'No results found' : 'No sent messages'}</h2>
            <p>{query ? 'Try a different search term.' : 'Messages you send will appear here.'}</p>
          </div>
        ) : (
          <div className="mail-list" role="list">
            {filtered.map((email) => (
              <button
                type="button"
                key={email._id}
                className={`mail-row ${selectedId === email._id ? 'selected' : ''}`}
                onClick={() => handleEmailClick(email._id)}
              >
                <div className="mail-row-main">
                  <span className="mail-row-sender">To: {email.recipient?.name || email.recipient?.email || 'Unknown recipient'}</span>
                  <span className="mail-row-content">
                    <span className="mail-row-subject">{email.subject || '(No subject)'}</span>
                    <span className="mail-row-sep"> – </span>
                    <span className="mail-row-preview">{(email.body || '').replace(/\s+/g, ' ').slice(0, 120)}</span>
                  </span>
                </div>
                <span className="mail-row-date">{formatDate(email.createdAt || email.updatedAt)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </MailLayout>
  );
};

export default Sent;
