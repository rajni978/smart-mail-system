import { useAuth } from '../context/AuthContext.jsx';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Dashboard</h1>
        <button onClick={logout} style={styles.logoutButton}>
          Logout
        </button>
      </div>

      <div style={styles.card}>
        <h2 style={styles.greeting}>Welcome, {user?.name}!</h2>
        <p style={styles.email}>Email: {user?.email}</p>
        <p style={styles.id}>User ID: {user?._id}</p>
      </div>

      <div style={styles.infoBox}>
        <h3>Authentication Status</h3>
        <p>You are logged in and your session is persisted in localStorage.</p>
        <p>Refresh the page — your authentication state will be preserved.</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 600,
    margin: '40px auto',
    padding: 20,
    fontFamily: 'system-ui, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    color: '#111',
    margin: 0,
  },
  logoutButton: {
    padding: '10px 20px',
    backgroundColor: '#dc2626',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  card: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: 24,
    marginBottom: 24,
  },
  greeting: {
    margin: 0,
    fontSize: 24,
    color: '#111',
  },
  email: {
    margin: '8px 0',
    color: '#333',
  },
  id: {
    margin: '8px 0',
    color: '#666',
    fontSize: 14,
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: 8,
    padding: 16,
  },
};

export default Dashboard;