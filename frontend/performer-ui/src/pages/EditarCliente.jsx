import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';

export default function EditarCliente() {
  const { id } = useParams();
  const [cliente, setCliente] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/clientes/${id}`)
      .then((res) => setCliente(res.data))
      .catch(() => setError("No se pudo cargar el cliente"));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCliente({ ...cliente, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/clientes/${id}`, cliente);
      navigate('/clientes');
    } catch (err) {
      console.error(err);
      setError("Error al actualizar cliente");
    }
  };

  if (!cliente) return <p>Cargando...</p>;

  return (
    <div>
      <h2>Editar Cliente</h2>
      <form onSubmit={handleSubmit}>
        {Object.keys(cliente).map(key => (
          key !== "id" && key !== "creadoEn" ? (
            key !== "activo" ? (
              <div key={key}>
                <label>{key}:</label>
                <input name={key} value={cliente[key]} onChange={handleChange} />
              </div>
            ) : (
              <div key={key}>
                <label>Activo:</label>
                <select name="activo" value={cliente.activo} onChange={handleChange}>
                  <option value={true}>Sí</option>
                  <option value={false}>No</option>
                </select>
              </div>
            )
          ) : null
        ))}
        <button type="submit">Guardar cambios</button>
      </form>
      {error && <p style={{color:'red'}}>{error}</p>}
    </div>
  );
}
