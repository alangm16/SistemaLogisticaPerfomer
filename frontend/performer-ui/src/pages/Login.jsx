import { useState } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, rol, nombre } = response.data;

      // Guardar token y datos en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('rol', rol);
      localStorage.setItem('nombre', nombre);

      // Redirigir según rol
      if (rol === 'ADMIN') {
        navigate('/admin/usuarios');
      } else if (rol === 'VENDEDOR') {
        navigate('/clientes');
      } else if (rol === 'PRICING') {
        navigate('/proveedores');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error("Error en login:", err);
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
    <div className="login-container">
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Password:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      {error && <p style={{color: 'red'}}>{error}</p>}
    </div>
  );
}
