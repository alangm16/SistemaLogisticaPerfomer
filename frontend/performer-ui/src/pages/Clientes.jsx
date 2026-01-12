import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/clientes')
      .then((res) => {
        setClientes(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando clientes:", err);
        setError("No se pudo cargar la lista de clientes");
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Cargando clientes...</p>;

  return (
    <div>
      <h2>Lista de Clientes</h2>
      {error && <p style={{color:'red'}}>{error}</p>}
      <table border="1" cellPadding="8" style={{marginTop:"1rem", width:"100%"}}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>RFC</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Dirección</th>
            <th>Ciudad</th>
            <th>País</th>
            <th>Código Postal</th>
            <th>Activo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map(c => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.nombre}</td>
              <td>{c.rfc}</td>
              <td>{c.email}</td>
              <td>{c.telefono}</td>
              <td>{c.direccion}</td>
              <td>{c.ciudad}</td>
              <td>{c.pais}</td>
              <td>{c.codigoPostal}</td>
              <td>{c.activo ? "Sí" : "No"}</td>
              <td>
                <button onClick={() => navigate(`/clientes/${c.id}/editar`)}>Editar</button>
                <button onClick={async () => {
                  if (window.confirm(`¿Seguro que deseas eliminar a ${c.nombre}?`)) {
                    try {
                      await api.delete(`/clientes/${c.id}`);
                      setClientes(clientes.filter(cl => cl.id !== c.id));
                    } catch (err) {
                      console.error("Error eliminando cliente:", err);
                      setError("No se pudo eliminar el cliente");
                    }
                  }
                }}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => navigate('/clientes/nuevo')}>Nuevo Cliente</button>
    </div>
  );
}
