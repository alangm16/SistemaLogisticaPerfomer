// src/pages/Clientes.jsx
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Subheader from '../components/Subheader';
import Footer from '../components/Footer';
import Swal from 'sweetalert2';
import '../styles/dashboard.css';
import '../styles/generales.css';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status] = useState('ok');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalNuevo, setModalNuevo] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [filtro, setFiltro] = useState('TODOS');
  const [busqueda, setBusqueda] = useState('');
  const [formData, setFormData] = useState({ 
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

  const rol = localStorage.getItem('rol');
  const nombre = localStorage.getItem('nombre');

  const cargar = async () => {
    try {
      const res = await api.get('/clientes');
      setClientes(res.data);
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const eliminar = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar cliente?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/clientes/${id}`);
      setClientes(c => c.filter(x => x.id !== id));
      cerrarModal();
      Swal.fire({
        icon: 'success',
        title: 'Eliminado',
        text: 'El cliente fue eliminado.',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) { 
      console.log(err); 
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el cliente.',
      });
    }
  };

  const abrirModal = (cliente) => {
    setClienteSeleccionado(cliente);
    setFormData({ 
      nombre: cliente.nombre, 
      rfc: cliente.rfc, 
      email: cliente.email, 
      telefono: cliente.telefono, 
      direccion: cliente.direccion, 
      ciudad: cliente.ciudad, 
      pais: cliente.pais, 
      codigoPostal: cliente.codigoPostal, 
      activo: cliente.activo 
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setModalNuevo(false);
    setClienteSeleccionado(null);
    setFormData({ 
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
  };

  const abrirModalNuevo = () => {
    setFormData({ 
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
    setModalNuevo(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const guardarCambios = async () => {
    const result = await Swal.fire({
      title: '¿Guardar cambios?',
      text: `¿Deseas guardar los cambios para ${formData.nombre}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await api.put(`/clientes/${clienteSeleccionado.id}`, formData);
      setClientes(c => c.map(x => 
        x.id === clienteSeleccionado.id ? { ...x, ...formData } : x
      ));
      cerrarModal();
      await Swal.fire({
        title: '¡Guardado!',
        text: 'Los cambios se guardaron correctamente.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.log(err);
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron guardar los cambios.',
        icon: 'error',
      });
    }
  };

  const crearCliente = async () => {
    if (!formData.nombre || !formData.email) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completa al menos el nombre y email',
      });
      return;
    }

    const result = await Swal.fire({
      title: '¿Crear cliente?',
      text: `¿Deseas crear al cliente ${formData.nombre}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Crear',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) return;

    try {
      const res = await api.post('/clientes', formData);
      setClientes([...clientes, res.data]);
      cerrarModal();
      await Swal.fire({
        icon: 'success',
        title: 'Cliente creado',
        text: 'El cliente fue creado correctamente.',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.log(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear el cliente.',
      });
    }
  };

  const clientesFiltrados = clientes.filter(c => {
    const coincideBusqueda = 
      c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      (c.rfc && c.rfc.toLowerCase().includes(busqueda.toLowerCase()));
    const coincideFiltro = filtro === 'TODOS' || 
      (filtro === 'ACTIVOS' && c.activo) || 
      (filtro === 'INACTIVOS' && !c.activo);
    return coincideBusqueda && coincideFiltro;
  });

  const contadores = {
    total: clientes.length,
    activos: clientes.filter(c => c.activo).length,
    inactivos: clientes.filter(c => !c.activo).length,
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar rol={rol} />
        <div className="dashboard-content">
          <Header nombre={nombre} rol={rol} />
          <Subheader status={status} onAgregarClick={abrirModalNuevo} />
          <main className="main-panel">
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Cargando clientes...</p>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar rol={rol} />
      
      <div className="dashboard-content">
        <Header nombre={nombre} rol={rol} />
        <Subheader 
          titulo="Gestión de Clientes"
          busqueda={busqueda}
          onBusquedaChange={setBusqueda}
          filtro={filtro}
          onFiltroChange={setFiltro}
          filtros={[
            { valor: 'TODOS', label: 'Todos' },
            { valor: 'ACTIVOS', label: 'Activos' },
            { valor: 'INACTIVOS', label: 'Inactivos' }
          ]}
          onAgregarClick={abrirModalNuevo}
        />
        
        <main className="main-panel">
          <div className="info-section">
            <div className="info-item">
              <i className="fa-solid fa-calendar"></i>
              <span className="info-value">
                {new Date().toLocaleDateString('es-MX', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            <div className="info-item">
              <div className={status === 'ok' ? 'status-indicator' : status === 'loading' ? 'status-indicator loading' : 'status-indicator error'}></div>
              <span>Sistema:</span>
              <span className="info-value">
                {status === 'ok' ? 'Operacional' : status === 'loading' ? 'Conectando...' : 'Error'}
              </span>
            </div>
            <div className="info-item">
              <i className="fa-solid fa-clock"></i>
              <span>Última actualización:</span>
              <span className="info-value">
                {new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon stat-icon-total">
                <i className="fa-solid fa-building"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{contadores.total}</div>
                <div className="stat-label">Total Clientes</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-activos">
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{contadores.activos}</div>
                <div className="stat-label">Activos</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-inactivos">
                <i className="fa-solid fa-circle-xmark"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{contadores.inactivos}</div>
                <div className="stat-label">Inactivos</div>
              </div>
            </div>
          </div>

          {error && (
            <div className="alert alert-error">
              <i className="fa-solid fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>RFC</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Ciudad</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.map(cliente => (
                  <tr key={cliente.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar-small">
                          {cliente.nombre.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="user-name-text">{cliente.nombre}</span>
                      </div>
                    </td>
                    <td>{cliente.rfc || 'N/A'}</td>
                    <td>{cliente.email}</td>
                    <td>{cliente.telefono || 'N/A'}</td>
                    <td>{cliente.ciudad || 'N/A'}</td>
                    <td>
                      <span className={`badge ${cliente.activo ? 'badge-activo' : 'badge-inactivo'}`}>
                        {cliente.activo ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </td>
                    <td>
                      <div className="dropdown">
                        <button
                          className="btn btn-sm btn-primary-app dropdown-toggle"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Opciones
                        </button>

                        <ul className="dropdown-menu dropdown-menu-end">
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={(e) => {
                                e.stopPropagation();
                                abrirModal(cliente);
                              }}
                            >
                              <i className="fa-solid fa-eye text-purple me-2"></i>
                              Ver Detalles
                            </button>
                          </li>

                          <li><hr className="dropdown-divider" /></li>

                          <li>
                            <button
                              className="dropdown-item text-danger"
                              onClick={(e) => {
                                e.stopPropagation();
                                eliminar(cliente.id);
                              }}
                            >
                              <i className="fa-solid fa-trash text-danger me-2"></i>
                              Eliminar
                            </button>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {clientesFiltrados.length === 0 && (
              <div className="empty-state">
                <i className="fa-solid fa-building-slash"></i>
                <p>No se encontraron clientes</p>
              </div>
            )}
          </div>
        </main>
        
        <Footer />
      </div>

      {/* Modal de edición */}
      {modalAbierto && clienteSeleccionado && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Cliente</h3>
              <button className="modal-close" onClick={cerrarModal}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="user-details-card">
                <div className="user-avatar-large">
                  {clienteSeleccionado.nombre.substring(0, 2).toUpperCase()}
                </div>
                <h4>{clienteSeleccionado.nombre}</h4>
                <p className="user-email">{clienteSeleccionado.email}</p>
                
                <div className="user-badges">
                  <span className={`badge ${clienteSeleccionado.activo ? 'badge-activo' : 'badge-inactivo'}`}>
                    {clienteSeleccionado.activo ? 'ACTIVO' : 'INACTIVO'}
                  </span>
                </div>
              </div>

              <div className="form-section">
                <label>ID del Cliente</label>
                <input 
                  type="text" 
                  value={clienteSeleccionado.id} 
                  disabled 
                  className="input-disabled"
                />
              </div>

              <div className="form-grid">
                <div className="form-section">
                  <label>Nombre *</label>
                  <input 
                    type="text" 
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="select-input"
                    placeholder="Ingrese el nombre"
                  />
                </div>

                <div className="form-section">
                  <label>RFC</label>
                  <input 
                    type="text" 
                    name="rfc"
                    value={formData.rfc}
                    onChange={handleInputChange}
                    className="select-input"
                    placeholder="Ingrese el RFC"
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-section">
                  <label>Email *</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="select-input"
                    placeholder="Ingrese el email"
                  />
                </div>

                <div className="form-section">
                  <label>Teléfono</label>
                  <input 
                    type="text" 
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="select-input"
                    placeholder="Ingrese el teléfono"
                  />
                </div>
              </div>

              <div className="form-section">
                <label>Dirección</label>
                <input 
                  type="text" 
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  className="select-input"
                  placeholder="Ingrese la dirección"
                />
              </div>

              <div className="form-grid">
                <div className="form-section">
                  <label>Ciudad</label>
                  <input 
                    type="text" 
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleInputChange}
                    className="select-input"
                    placeholder="Ingrese la ciudad"
                  />
                </div>

                <div className="form-section">
                  <label>País</label>
                  <input 
                    type="text" 
                    name="pais"
                    value={formData.pais}
                    onChange={handleInputChange}
                    className="select-input"
                    placeholder="Ingrese el país"
                  />
                </div>

                <div className="form-section">
                  <label>Código Postal</label>
                  <input 
                    type="text" 
                    name="codigoPostal"
                    value={formData.codigoPostal}
                    onChange={handleInputChange}
                    className="select-input"
                    placeholder="CP"
                  />
                </div>
              </div>

              <div className="form-section">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    name="activo"
                    checked={formData.activo}
                    onChange={handleInputChange}
                    className="checkbox-input"
                  />
                  <span className="ml-2">Cliente Activo</span>
                </label>
              </div>

              <div className="form-section">
                <button 
                  className="btn btn-primary btn-full"
                  onClick={guardarCambios}
                >
                  <i className="fa-solid fa-save"></i>
                  Guardar
                </button>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-danger"
                onClick={() => eliminar(clienteSeleccionado.id)}
              >
                <i className="fa-solid fa-trash"></i>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de nuevo cliente */}
      {modalNuevo && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nuevo Cliente</h3>
              <button className="modal-close" onClick={cerrarModal}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="form-grid">
                <div className="form-section">
                  <label>Nombre *</label>
                  <input 
                    type="text" 
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="select-input"
                    placeholder="Ingrese el nombre"
                  />
                </div>

                <div className="form-section">
                  <label>RFC</label>
                  <input 
                    type="text" 
                    name="rfc"
                    value={formData.rfc}
                    onChange={handleInputChange}
                    className="select-input"
                    placeholder="Ingrese el RFC"
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-section">
                  <label>Email *</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="select-input"
                    placeholder="Ingrese el email"
                  />
                </div>

                <div className="form-section">
                  <label>Teléfono</label>
                  <input 
                    type="text" 
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="select-input"
                    placeholder="Ingrese el teléfono"
                  />
                </div>
              </div>

              <div className="form-section">
                <label>Dirección</label>
                <input 
                  type="text" 
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  className="select-input"
                  placeholder="Ingrese la dirección"
                />
              </div>

              <div className="form-grid">
                <div className="form-section">
                  <label>Ciudad</label>
                  <input 
                    type="text" 
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleInputChange}
                    className="select-input"
                    placeholder="Ingrese la ciudad"
                  />
                </div>

                <div className="form-section">
                  <label>País</label>
                  <input 
                    type="text" 
                    name="pais"
                    value={formData.pais}
                    onChange={handleInputChange}
                    className="select-input"
                    placeholder="Ingrese el país"
                  />
                </div>

                <div className="form-section">
                  <label>Código Postal</label>
                  <input 
                    type="text" 
                    name="codigoPostal"
                    value={formData.codigoPostal}
                    onChange={handleInputChange}
                    className="select-input"
                    placeholder="CP"
                  />
                </div>
              </div>

              <div className="form-section">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    name="activo"
                    checked={formData.activo}
                    onChange={handleInputChange}
                    className="checkbox-input"
                  />
                  <span>Cliente Activo</span>
                </label>
              </div>

              <div className="form-section">
                <button 
                  className="btn btn-primary btn-full"
                  onClick={crearCliente}
                >
                  <i className="fa-solid fa-plus"></i>
                  Crear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}