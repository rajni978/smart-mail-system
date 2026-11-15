import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-brand" onClick={() => scrollTo('home')}>
            <div className="landing-logo">SM</div>
            <span className="landing-brand-name">Smart Mail</span>
          </div>

          <button
            className="landing-menu-btn"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>

          <div className={`landing-links ${menuOpen ? 'open' : ''}`}>
            <button className="landing-link" onClick={() => scrollTo('home')}>Home</button>
            <button className="landing-link" onClick={() => scrollTo('features')}>Features</button>
            <button className="landing-link" onClick={() => scrollTo('about')}>About</button>
            <div className="landing-nav-actions">
              <button className="landing-btn-secondary" onClick={() => { setMenuOpen(false); navigate('/login'); }}>Login</button>
              <button className="landing-btn-primary" onClick={() => { setMenuOpen(false); navigate('/register'); }}>Get Started</button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <section id="home" className="landing-hero">
          <div className="landing-container hero-grid">
            <div className="hero-copy">
              <span className="hero-badge">Smart, accessible email</span>
              <h1>Your Inbox. Smarter, Faster, and More Accessible.</h1>
              <p className="hero-desc">
                Manage your emails effortlessly with smart inbox management, a voice-powered email assistant, and a foundation ready for real-time notifications.
              </p>
              <div className="hero-actions">
                <button className="landing-btn-primary large" onClick={() => navigate('/register')}>Get Started</button>
                <button className="landing-btn-secondary large" onClick={() => navigate('/login')}>Login</button>
              </div>
            </div>

            <div className="hero-visual" aria-hidden="true">
              <div className="preview-window">
                <div className="preview-top">
                  <div className="preview-dots"><span /><span /><span /></div>
                  <div className="preview-search">Search mail...</div>
                </div>
                <div className="preview-body">
                  <div className="preview-sidebar">
                    <div className="p-nav compose">+ Compose</div>
                    <div className="p-nav active">Inbox</div>
                    <div className="p-nav">Sent</div>
                  </div>
                  <div className="preview-content">
                    <div className="p-header">Inbox <small>3 messages</small></div>
                    <div className="p-row unread">
                      <span className="p-sender">Alex Chen</span>
                      <span className="p-subject">Project update <em>– Here is the latest summary...</em></span>
                      <span className="p-time">09:24</span>
                    </div>
                    <div className="p-row">
                      <span className="p-sender">Maya Patel</span>
                      <span className="p-subject">Meeting notes <em>– Thanks for joining today...</em></span>
                      <span className="p-time">Yesterday</span>
                    </div>
                    <div className="p-row">
                      <span className="p-sender">Team Smart Mail</span>
                      <span className="p-subject">Welcome <em>– Get started with your inbox...</em></span>
                      <span className="p-time">Mon</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="landing-section">
          <div className="landing-container">
            <div className="section-head">
              <h2>Everything you need for clearer communication</h2>
              <p>Built-in tools for managing, reading, and sending email with accessibility in mind.</p>
            </div>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">▣</div>
                <h3>Smart Inbox Management</h3>
                <p>Organize and review incoming messages in a clean, focused inbox with clear read states and previews.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔔</div>
                <h3>Real-Time Email Notifications</h3>
                <p><span className="tag">Planned</span> Instant alerts for new messages are planned to keep you updated without refreshing.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔊</div>
                <h3>Voice Email Assistant</h3>
                <p>Listen to email content with built-in browser speech controls for a more accessible reading experience.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔒</div>
                <h3>Secure User Authentication</h3>
                <p>Protected access with account registration, login, and authenticated routes for your mail.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">✉</div>
                <h3>Send and Receive Messages</h3>
                <p>Compose, send, and view messages in dedicated Inbox, Sent, and Email views.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="landing-section alt">
          <div className="landing-container">
            <div className="section-head">
              <h2>How it works</h2>
              <p>Get started in a few simple steps.</p>
            </div>
            <div className="steps-grid">
              <div className="step-card">
                <div className="step-num">1</div>
                <h3>Create your account</h3>
                <p>Register securely and sign in to access your personal Smart Mail workspace.</p>
              </div>
              <div className="step-card">
                <div className="step-num">2</div>
                <h3>Send and receive messages</h3>
                <p>Compose new emails, manage your inbox, and keep track of what you’ve sent.</p>
              </div>
              <div className="step-card">
                <div className="step-num">3</div>
                <h3>Get notified and listen</h3>
                <p>Open messages to read clearly and use the voice assistant; real-time notifications are planned.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="landing-section">
          <div className="landing-container about-grid">
            <div>
              <h2>About Smart Mail</h2>
              <p>
                Smart Mail is designed to make everyday email communication easier, clearer, and more accessible. By combining a clean inbox experience with secure account access and a voice-powered assistant, it helps people focus on what matters in their messages.
              </p>
              <p>
                Our focus is on simplicity and accessibility—providing practical tools today while building toward smarter, more responsive communication features.
              </p>
            </div>
            <div className="about-card">
              <h3>Built for accessibility</h3>
              <ul>
                <li>Clear, readable layouts</li>
                <li>Voice-assisted email reading</li>
                <li>Responsive on desktop, tablet, and mobile</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="landing-cta">
          <div className="landing-container cta-inner">
            <h2>Make Your Email Experience Smarter.</h2>
            <p>Start using Smart Mail to manage and listen to your messages with ease.</p>
            <button className="landing-btn-primary large" onClick={() => navigate('/register')}>Get Started</button>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-container footer-inner">
          <div className="footer-brand">
            <div className="landing-logo small">SM</div>
            <span>Smart Mail</span>
          </div>
          <div className="footer-links">
            <button onClick={() => scrollTo('home')}>Home</button>
            <button onClick={() => scrollTo('features')}>Features</button>
            <button onClick={() => scrollTo('about')}>About</button>
            <Link to="/login">Login</Link>
            <Link to="/register">Get Started</Link>
          </div>
          <p className="footer-copy">© {new Date().getFullYear()} Smart Mail. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
