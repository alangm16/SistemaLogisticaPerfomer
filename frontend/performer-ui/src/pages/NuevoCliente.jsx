import { useState } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function NuevoCliente() {
  const [form, setForm] = useState({
    nombre: '',
    rfc: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    pais: '',
    codigoPostal: '',
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
      await api.post('/clientes', form);
      navigate('/clientes');
    } catch (err) {
      console.error(err);
      setError("Error al crear cliente");
    }
  };

  return (
    <div>
      <h2>Nuevo Cliente</h2>
      <form onSubmit={handleSubmit}>
        {Object.keys(form).map(key => (
          key !== "activo" ? (
            <div key={key}>
              <label>{key}:</label>
              <input name={key} value={form[key]} onChange={handleChange} />
            </div>
          ) : (
            <div key={key}>
              <label>Activo:</label>
              <select name="activo" value={form.activo} onChange={handleChange}>
                <option value={true}>Sí</option>
                <option value={false}>No</option>
              </select>
            </div>
          )
        ))}
        <button type="submit">Crear</button>
      </form>
      {error && <p style={{color:'red'}}>{error}</p>}
    </div>
  );
}
