import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await api('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      login(
        { _id: data._id, name: data.name, email: data.email },
        data.token
      );
      navigate('/inbox', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Create Account</h2>
      {error && <div style={styles.error}>{error}</div>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password (min 6 chars)"
            required
            style={styles.input}
          />
        </div>
        <button type="submit" disabled={loading} style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p style={styles.linkText}>
        Already have an account? <a onClick={(e) => { e.preventDefault(); navigate('/login'); }} style={styles.link}>Login</a>
      </p>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 400,
    margin: '60px auto',
    padding: 20,
    fontFamily: 'system-ui, sans-serif',
  },
  heading: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: 10,
    borderRadius: 6,
    marginBottom: 16,
    fontSize: 14,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: 600,
    color: '#555',
  },
  input: {
    padding: 10,
    border: '1px solid #ddd',
    borderRadius: 6,
    fontSize: 14,
  },
  button: {
    padding: 12,
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
  },
  linkText: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
    cursor: 'pointer',
    fontWeight: 600,
  },
};

export default Register;