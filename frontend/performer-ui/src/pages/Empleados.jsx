import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Empleados() {
  const [empleados, setEmpleados] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/empleados')
      .then((res) => {
        setEmpleados(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando empleados:", err);
        setError("No se pudo cargar la lista de empleados");
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Cargando empleados...</p>;

  return (
    <div>
      <h2>Lista de Empleados</h2>
      {error && <p style={{color:'red'}}>{error}</p>}
      <table border="1" cellPadding="8" style={{marginTop:"1rem", width:"100%"}}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {empleados.map(emp => (
            <tr key={emp.id}>
              <td>{emp.id}</td>
              <td>{emp.nombre}</td>
              <td>{emp.email}</td>
              <td>{emp.rol}</td>
              <td>{emp.estado}</td>
              <td>
                <button onClick={() => navigate(`/empleados/${emp.id}/editar`)}>Editar</button>
                <button 
                    onClick={async () => {
                    if (window.confirm(`¿Seguro que deseas eliminar a ${emp.nombre}?`)) {
                        try {
                        await api.delete(`/empleados/${emp.id}`);
                        setEmpleados(empleados.filter(e => e.id !== emp.id));
                        } catch (err) {
                        console.error("Error eliminando empleado:", err);
                        setError("No se pudo eliminar el empleado");
                        }
                    }
                    }}
                >
                    Eliminar
                </button>
                </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => navigate('/empleados/nuevo')}>Nuevo Empleado</button>
    </div>
  );
}
