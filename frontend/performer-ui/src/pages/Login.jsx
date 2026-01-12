import { useState } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, rol, nombre } = response.data;

      // Guardar token en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('rol', rol);
      localStorage.setItem('nombre', nombre);

      // Redirigir al dashboard
      navigate('/dashboard');
    } catch (err) {
        console.error("Error en login:", err);
        setError('Credenciales inválidas o error de conexión');
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
        <button type="submit">Entrar</button>
      </form>
      {error && <p style={{color: 'red'}}>{error}</p>}
    </div>
  );
}
