import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function Navigation() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user && user.role === 'admin';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="glass-nav">
      <div className="nav-brand">
        <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-dark)', fontWeight: 'bold', fontSize: '1.2rem' }}>
          MiniBlog
        </Link>
        {isAdmin && (
          <span style={{ marginLeft: '10px', fontSize: '0.8rem', backgroundColor: 'var(--danger)', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>
            Admin
          </span>
        )}
      </div>
      <div className="nav-links">
        <Link to="/" className="nav-item">Home</Link>
        {token ? (
          <>
            <Link to="/dashboard" className="nav-item">Dashboard</Link>
            <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.3rem 0.8rem', fontSize: '0.9rem' }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-item">Login</Link>
            <Link to="/register" className="nav-item">Register</Link>
            <Link to="/login?type=admin" className="nav-item" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--danger)' }}>
               <ShieldAlert size={16} /> Admin
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
