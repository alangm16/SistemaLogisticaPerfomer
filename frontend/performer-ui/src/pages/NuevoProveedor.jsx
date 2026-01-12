import { useState } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function NuevoProveedor() {
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    pais: '',
    ciudad: '',
    activo: true
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/proveedores', form);
      navigate('/proveedores');
    } catch (err) {
      console.error(err);
      setError("Error al crear proveedor");
    }
  };

  return (
    <div>
      <h2>Nuevo Proveedor</h2>
      <form onSubmit={handleSubmit}>
        <div><label>Nombre:</label><input name="nombre" value={form.nombre} onChange={handleChange} required /></div>
        <div><label>Email:</label><input type="email" name="email" value={form.email} onChange={handleChange} /></div>
        <div><label>Teléfono:</label><input name="telefono" value={form.telefono} onChange={handleChange} /></div>
        <div><label>País:</label><input name="pais" value={form.pais} onChange={handleChange} /></div>
        <div><label>Ciudad:</label><input name="ciudad" value={form.ciudad} onChange={handleChange} /></div>
        <div>
          <label>Activo:</label>
          <select name="activo" value={form.activo} onChange={handleChange}>
            <option value={true}>Sí</option>
            <option value={false}>No</option>
          </select>
        </div>
        <button type="submit">Crear</button>
      </form>
      {error && <p style={{color:'red'}}>{error}</p>}
    </div>
  );
}
