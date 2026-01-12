import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';

export default function EditarEmpleado() {
  const { id } = useParams();
  const [empleado, setEmpleado] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/empleados/${id}`)
      .then((res) => setEmpleado(res.data))
      .catch(() => setError("No se pudo cargar el empleado"));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/empleados/${id}`, empleado);
      navigate('/empleados');
    } catch (err) {
      console.error(err);
      setError("Error al actualizar empleado");
    }
  };

  if (!empleado) return <p>Cargando...</p>;

  return (
    <div>
      <h2>Editar Empleado</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre:</label>
          <input 
            value={empleado.nombre} 
            onChange={(e) => setEmpleado({...empleado, nombre: e.target.value})} 
            required 
          />
        </div>
        <div>
          <label>Email:</label>
          <input 
            type="email" 
            value={empleado.email} 
            onChange={(e) => setEmpleado({...empleado, email: e.target.value})} 
            required 
          />
        </div>
        <div>
          <label>Password:</label>
          <input 
            type="password" 
            value={empleado.passwordHash} 
            onChange={(e) => setEmpleado({...empleado, passwordHash: e.target.value})} 
            required 
          />
        </div>
        <div>
          <label>Rol:</label>
          <select 
            value={empleado.rol} 
            onChange={(e) => setEmpleado({...empleado, rol: e.target.value})}
          >
            <option value="VENDEDOR">VENDEDOR</option>
            <option value="PRICING">PRICING</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
        <div>
          <label>Estado:</label>
          <select 
            value={empleado.estado} 
            onChange={(e) => setEmpleado({...empleado, estado: e.target.value})}
          >
            <option value="ACTIVO">ACTIVO</option>
            <option value="INACTIVO">INACTIVO</option>
            <option value="PENDIENTE">PENDIENTE</option>
          </select>
        </div>
        <button type="submit">Guardar cambios</button>
      </form>
      {error && <p style={{color:'red'}}>{error}</p>}
    </div>
  );
}
