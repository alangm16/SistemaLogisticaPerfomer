import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';

export default function EditarProveedor() {
  const { id } = useParams();
  const [proveedor, setProveedor] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/proveedores/${id}`)
      .then((res) => setProveedor(res.data))
      .catch(() => setError("No se pudo cargar el proveedor"));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProveedor({ ...proveedor, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/proveedores/${id}`, proveedor);
      navigate('/proveedores');
    } catch (err) {
      console.error(err);
      setError("Error al actualizar proveedor");
    }
  };

  if (!proveedor) return <p>Cargando...</p>;

  return (
    <div>
      <h2>Editar Proveedor</h2>
      <form onSubmit={handleSubmit}>
        <div><label>Nombre:</label><input name="nombre" value={proveedor.nombre} onChange={handleChange} required /></div>
        <div><label>Email:</label><input type="email" name="email" value={proveedor.email} onChange={handleChange} /></div>
        <div><label>Teléfono:</label><input name="telefono" value={proveedor.telefono} onChange={handleChange} /></div>
        <div><label>País:</label><input name="pais" value={proveedor.pais} onChange={handleChange} /></div>
        <div><label>Ciudad:</label><input name="ciudad" value={proveedor.ciudad} onChange={handleChange} /></div>
        <div>
          <label>Activo:</label>
          <select name="activo" value={proveedor.activo} onChange={handleChange}>
            <option value={true}>Sí</option>
            <option value={false}>No</option>
          </select>
        </div>
        <button type="submit">Guardar cambios</button>
      </form>
      {error && <p style={{color:'red'}}>{error}</p>}
    </div>
  );
}
