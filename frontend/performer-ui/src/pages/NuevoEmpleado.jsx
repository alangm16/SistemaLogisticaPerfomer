import { useState } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function NuevoEmpleado() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [passwordHash, setPasswordHash] = useState('');
  const [rol, setRol] = useState('VENDEDOR');
  const [estado, setEstado] = useState('ACTIVO');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await api.post('/empleados', {
        nombre,
        email,
        passwordHash,
        rol,
        estado
      });
      navigate('/empleados'); // redirige a la lista
    } catch (err) {
      console.error(err);
      setError('Error al crear empleado');
    }
  };

  return (
    <div>
      <h2>Nuevo Empleado</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre:</label>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={passwordHash} onChange={(e) => setPasswordHash(e.target.value)} required />
        </div>
        <div>
          <label>Rol:</label>
          <select value={rol} onChange={(e) => setRol(e.target.value)}>
            <option value="VENDEDOR">VENDEDOR</option>
            <option value="PRICING">PRICING</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
        <div>
          <label>Estado:</label>
          <select value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="ACTIVO">ACTIVO</option>
            <option value="INACTIVO">INACTIVO</option>
            <option value="PENDIENTE">PENDIENTE</option>
          </select>
        </div>
        <button type="submit">Crear</button>
      </form>
      {error && <p style={{color:'red'}}>{error}</p>}
    </div>
  );
}
