import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/proveedores')
      .then((res) => {
        setProveedores(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando proveedores:", err);
        setError("No se pudo cargar la lista de proveedores");
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Cargando proveedores...</p>;

  return (
    <div>
      <h2>Lista de Proveedores</h2>
      {error && <p style={{color:'red'}}>{error}</p>}
      <table border="1" cellPadding="8" style={{marginTop:"1rem", width:"100%"}}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>País</th>
            <th>Ciudad</th>
            <th>Activo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {proveedores.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.nombre}</td>
              <td>{p.email}</td>
              <td>{p.telefono}</td>
              <td>{p.pais}</td>
              <td>{p.ciudad}</td>
              <td>{p.activo ? "Sí" : "No"}</td>
              <td>
                <button onClick={() => navigate(`/proveedores/${p.id}/editar`)}>Editar</button>
                <button onClick={async () => {
                  if (window.confirm(`¿Seguro que deseas eliminar a ${p.nombre}?`)) {
                    try {
                      await api.delete(`/proveedores/${p.id}`);
                      setProveedores(proveedores.filter(pr => pr.id !== p.id));
                    } catch (err) {
                      console.error("Error eliminando proveedor:", err);
                      setError("No se pudo eliminar el proveedor");
                    }
                  }
                }}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => navigate('/proveedores/nuevo')}>Nuevo Proveedor</button>
    </div>
  );
}
