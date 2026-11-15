import { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import { createSocket } from '../services/socket.js';
import Toast from './Toast.jsx';
import './MailLayout.css';

const MailLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [toast, setToast] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);
  const seenEmailIdsRef = useRef(new Set());

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api('/api/emails/unread-count');
      const count = Number(data?.unreadCount);
      setUnreadCount(Number.isFinite(count) && count > 0 ? count : 0);
    } catch {
      // keep previous count on transient failures
    }
  }, [user]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    setSearch(searchParams.get('q') || '');
  }, [searchParams]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      seenEmailIdsRef.current = new Set();
      return;
    }
    fetchUnreadCount();
  }, [user, fetchUnreadCount]);

  useEffect(() => {
    if (!user) return;
    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchUnreadCount();
    };
    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [user, fetchUnreadCount]);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const token = localStorage.getItem('token');
    const socket = createSocket(token);
    if (!socket) return;
    socketRef.current = socket;

    const onEmailNew = (email) => {
      const id = email?._id;
      if (id) {
        if (seenEmailIdsRef.current.has(id)) return;
        seenEmailIdsRef.current.add(id);
      }
      setUnreadCount((c) => c + 1);
      const senderName = email?.sender?.name || email?.sender?.email || 'Someone';
      const subject = email?.subject || '(No subject)';
      setToast({ id: id || `${Date.now()}`, sender: senderName, subject });
      window.dispatchEvent(new CustomEvent('smartmail:email:new', { detail: email }));
    };

    const onEmailRead = (event) => {
      const id = event?.detail?.id;
      if (!id) return;
      setUnreadCount((c) => (c > 0 ? c - 1 : 0));
    };

    socket.on('email:new', onEmailNew);
    socket.on('connect', fetchUnreadCount);
    socket.on('connect_error', () => {
      // reconnection handled by socket.io-client; keep silent to avoid noisy UI
    });
    window.addEventListener('smartmail:email:read', onEmailRead);

    socket.connect();

    return () => {
      socket.off('email:new', onEmailNew);
      socket.off('connect', fetchUnreadCount);
      socket.off('connect_error');
      window.removeEventListener('smartmail:email:read', onEmailRead);
      socket.disconnect();
      if (socketRef.current === socket) socketRef.current = null;
    };
  }, [user, fetchUnreadCount]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  const handleSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    const base = location.pathname === '/sent' ? '/sent' : '/inbox';
    navigate(q ? `${base}?q=${encodeURIComponent(q)}` : base);
  };

  const initials = (user?.name || user?.email || 'U').trim().charAt(0).toUpperCase();

  return (
    <div className="mail-app">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <header className="mail-header">
        <div className="header-left">
          <button className="icon-btn menu-btn" onClick={() => setSidebarOpen((v) => !v)} aria-label="Toggle menu">
            <span />
            <span />
            <span />
          </button>
          <div className="mail-brand">
            <div className="brand-mark">SM</div>
            <span className="brand-name">Smart Mail</span>
          </div>
        </div>
        <form className="header-search" onSubmit={handleSearch}>
          <input
            type="search"
            placeholder="Search mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search mail"
          />
        </form>
        <div className="header-right">
          <button className="icon-btn theme-btn" onClick={toggleTheme} aria-label="Toggle theme" title="Toggle theme">
            {theme === 'light' ? '☾' : '☀'}
          </button>
          <div className="user-chip">
            <div className="user-avatar">{initials}</div>
            <div className="user-meta">
              <span className="user-name">{user?.name || 'User'}</span>
              <span className="user-email">{user?.email || ''}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="mail-body">
        <aside className={`mail-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <nav className="mail-nav">
            <NavLink to="/compose" className="compose-btn">
              <span className="nav-icon">+</span>
              <span className="nav-label">Compose</span>
            </NavLink>
            <NavLink to="/inbox" className={({ isActive }) => `mail-nav-link ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">▣</span>
              <span className="nav-label nav-label-with-badge">
                Inbox
                {unreadCount > 0 && <span className="unread-badge" aria-label={`${unreadCount} unread`}>{unreadCount}</span>}
              </span>
            </NavLink>
            <NavLink to="/sent" className={({ isActive }) => `mail-nav-link ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">➤</span>
              <span className="nav-label">Sent</span>
            </NavLink>
          </nav>
          <div className="sidebar-footer">
            <div className="sidebar-user">
              <div className="user-avatar small">{initials}</div>
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{user?.name || 'User'}</div>
                <div className="sidebar-user-email">{user?.email || ''}</div>
              </div>
            </div>
            <button className="logout-btn" onClick={logout}>Logout</button>
          </div>
        </aside>

        {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

        <main className="mail-main">{children}</main>
      </div>

      <nav className="mobile-nav">
        <NavLink to="/inbox" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
          <span className="m-icon m-icon-badge-wrap">
            ▣
            {unreadCount > 0 && <span className="unread-badge mobile">{unreadCount}</span>}
          </span>
          <span>Inbox</span>
        </NavLink>
        <NavLink to="/compose" className={({ isActive }) => `mobile-nav-item primary ${isActive ? 'active' : ''}`}>
          <span className="m-icon">+</span><span>Compose</span>
        </NavLink>
        <NavLink to="/sent" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
          <span className="m-icon">➤</span><span>Sent</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default MailLayout;
