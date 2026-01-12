// frontend/src/pages/AdminUsuarios.jsx
import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    try {
      const res = await api.get('/empleados');
      setUsuarios(res.data);
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const aprobar = async (id) => {
    try {
      await api.post(`/empleados/${id}/aprobar`);
      setUsuarios(u => u.map(x => x.id === id ? { ...x, estado: 'ACTIVO' } : x));
    } catch (err) { 
        console.log(err);
        setError('No se pudo aprobar usuario'); }
  };

  const rechazar = async (id) => {
    try {
      await api.post(`/empleados/${id}/rechazar`);
      setUsuarios(u => u.map(x => x.id === id ? { ...x, estado: 'INACTIVO' } : x));
    } catch (err) { console.log(err); setError('No se pudo rechazar usuario'); }
  };

  const cambiarRol = async (id, rol) => {
    try {
      await api.post(`/empleados/${id}/rol`, null, { params: { rol } });
      setUsuarios(u => u.map(x => x.id === id ? { ...x, rol } : x));
    } catch (err) { console.log(err); setError('No se pudo cambiar el rol'); }
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar este usuario?')) return;
    try {
      await api.delete(`/empleados/${id}`);
      setUsuarios(u => u.filter(x => x.id !== id));
    } catch (err) { console.log(err); setError('No se pudo eliminar usuario'); }
  };

  if (loading) return <p>Cargando usuarios...</p>;

  return (
    <div>
      <h2>Dashboard de Administrador</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <table border="1" cellPadding="8" style={{ marginTop: '1rem', width: '100%' }}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones</th>
            <th>Cambiar rol</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(u => (
            <tr key={u.id}>
              <td>{u.nombre}</td>
              <td>{u.email}</td>
              <td>{u.rol}</td>
              <td>{u.estado}</td>
              <td>
                <button onClick={() => aprobar(u.id)} disabled={u.estado === 'ACTIVO'}>Aprobar</button>
                <button onClick={() => rechazar(u.id)} disabled={u.estado === 'INACTIVO'}>Rechazar</button>
                <button onClick={() => eliminar(u.id)}>Eliminar</button>
              </td>
              <td>
                <select value={u.rol} onChange={(e) => cambiarRol(u.id, e.target.value)}>
                  <option value="VENDEDOR">VENDEDOR</option>
                  <option value="PRICING">PRICING</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
