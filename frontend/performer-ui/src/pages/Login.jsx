import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [animate, setAnimate] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setAnimate(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, rol, nombre } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('rol', rol);
      localStorage.setItem('nombre', nombre);

      if (rol === 'ADMIN' || rol === 'VENDEDOR' || rol === 'PRICING') {
        navigate('/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Tu cuenta está pendiente de aprobación o inactiva');
      } else if (err.response?.status === 401) {
        setError('Credenciales inválidas');
      } else {
        setError('Error de conexión con el servidor');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* LOGIN */}
      <div className={`login-panel ${animate ? 'enter' : ''}`}>
        <div className="login-card">

          <div className="logo">
            <div className="logo-mark">P</div>
            <div className="logo-text">Performer Logistics</div>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="input-wrapper">
              <i className="fa-solid fa-user"></i>
              <input
                type="email"
                placeholder="User"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-wrapper">
              <i className="fa-solid fa-lock"></i>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="forgot-password">
              <a href="/recuperar">Forgot Password?</a>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Login'}
            </button>

            {error && <p className="error">{error}</p>}
          </form>

          <div className="icon-row">
            <i className="fa-solid fa-ship"></i>
            <i className="fa-solid fa-truck"></i>
            <i className="fa-solid fa-plane"></i>
          </div>

        </div>
      </div>

      {/* BRAND */}
      <div className="brand-panel">
        <div className="brand-content">
          <h1>Digital Logistics Platform</h1>
          <p>Smart solutions connecting your operation with the world.</p>
        </div>
        {/* BUBBLES */}
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
      </div>

    </div>
  );
}
