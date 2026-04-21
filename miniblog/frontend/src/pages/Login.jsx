import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';
import API from '../axiosConfig';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  
  const searchParams = new URLSearchParams(location.search);
  const isAdminLogin = searchParams.get('type') === 'admin';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await API.post('/auth/login', { email, password });
      if (res.data.success) {
        const user = res.data.data.user;
        
        // Minor friendly check: if they used the admin login form, but aren't admin!
        if (isAdminLogin && user.role !== 'admin') {
           setError("Access Denied: You do not have admin privileges.");
           return;
        }

        localStorage.setItem('token', res.data.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.data.user));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '450px', marginTop: '10vh' }}>
      <div className="glass-panel" style={{ border: isAdminLogin ? '2px solid rgba(231, 76, 60, 0.4)' : undefined }}>
        <h2 className="title" style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          {isAdminLogin ? <><Shield color="var(--danger)" /> Admin Portal</> : 'Welcome Back'}
        </h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Sign In
          </button>
        </form>
        
        {!isAdminLogin && (
          <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--primary)' }}>Register</Link>
          </p>
        )}
      </div>
    </div>
  );
}
