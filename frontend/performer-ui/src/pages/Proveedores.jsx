// src/pages/Proveedores.jsx
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Subheader from '../components/Subheader';
import Footer from '../components/Footer';
import Swal from 'sweetalert2';
import '../styles/dashboard.css';
import '../styles/generales.css';

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status] = useState('ok');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalNuevo, setModalNuevo] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [filtro, setFiltro] = useState('TODOS');
  const [busqueda, setBusqueda] = useState('');
  const [formData, setFormData] = useState({ 
    nombre: '', 
    email: '', 
    telefono: '', 
    pais: '', 
    ciudad: '', 
    activo: true 
  });

  const rol = localStorage.getItem('rol');
  const nombre = localStorage.getItem('nombre');

  const cargar = async () => {
    try {
      const res = await api.get('/proveedores');
      setProveedores(res.data);
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar proveedores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const eliminar = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar proveedor?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/proveedores/${id}`);
      setProveedores(p => p.filter(x => x.id !== id));
      cerrarModal();
      Swal.fire({
        icon: 'success',
        title: 'Eliminado',
        text: 'El proveedor fue eliminado.',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) { 
      console.log(err); 
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el proveedor.',
      });
    }
  };

  const abrirModal = (proveedor) => {
    setProveedorSeleccionado(proveedor);
    setFormData({ 
      nombre: proveedor.nombre, 
      email: proveedor.email, 
      telefono: proveedor.telefono, 
      pais: proveedor.pais, 
      ciudad: proveedor.ciudad, 
      activo: proveedor.activo 
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setModalNuevo(false);
    setProveedorSeleccionado(null);
    setFormData({ 
      nombre: '', 
      email: '', 
      telefono: '', 
      pais: '', 
      ciudad: '', 
      activo: true 
    });
  };

  const abrirModalNuevo = () => {
    setFormData({ 
      nombre: '', 
      email: '', 
      telefono: '', 
      pais: '', 
      ciudad: '', 
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
      await api.put(`/proveedores/${proveedorSeleccionado.id}`, formData);
      setProveedores(p => p.map(x => 
        x.id === proveedorSeleccionado.id ? { ...x, ...formData } : x
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

  const crearProveedor = async () => {
    if (!formData.nombre) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completa al menos el nombre',
      });
      return;
    }

    const result = await Swal.fire({
      title: '¿Crear proveedor?',
      text: `¿Deseas crear al proveedor ${formData.nombre}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Crear',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) return;

    try {
      const res = await api.post('/proveedores', formData);
      setProveedores([...proveedores, res.data]);
      cerrarModal();
      await Swal.fire({
        icon: 'success',
        title: 'Proveedor creado',
        text: 'El proveedor fue creado correctamente.',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.log(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear el proveedor.',
      });
    }
  };

  const proveedoresFiltrados = proveedores.filter(p => {
    const coincideBusqueda = 
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.email && p.email.toLowerCase().includes(busqueda.toLowerCase())) ||
      (p.pais && p.pais.toLowerCase().includes(busqueda.toLowerCase())) ||
      (p.ciudad && p.ciudad.toLowerCase().includes(busqueda.toLowerCase()));
    const coincideFiltro = filtro === 'TODOS' || 
      (filtro === 'ACTIVOS' && p.activo) || 
      (filtro === 'INACTIVOS' && !p.activo);
    return coincideBusqueda && coincideFiltro;
  });

  const contadores = {
    total: proveedores.length,
    activos: proveedores.filter(p => p.activo).length,
    inactivos: proveedores.filter(p => !p.activo).length,
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
              <p>Cargando proveedores...</p>
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
          titulo="Gestión de Proveedores"
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
                <i className="fa-solid fa-truck"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{contadores.total}</div>
                <div className="stat-label">Total Proveedores</div>
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
                  <th>Proveedor</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>País</th>
                  <th>Ciudad</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {proveedoresFiltrados.map(proveedor => (
                  <tr key={proveedor.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar-small">
                          {proveedor.nombre.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="user-name-text">{proveedor.nombre}</span>
                      </div>
                    </td>
                    <td>{proveedor.email || 'N/A'}</td>
                    <td>{proveedor.telefono || 'N/A'}</td>
                    <td>{proveedor.pais || 'N/A'}</td>
                    <td>{proveedor.ciudad || 'N/A'}</td>
                    <td>
                      <span className={`badge ${proveedor.activo ? 'badge-activo' : 'badge-inactivo'}`}>
                        {proveedor.activo ? 'ACTIVO' : 'INACTIVO'}
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
                                abrirModal(proveedor);
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
                                eliminar(proveedor.id);
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

            {proveedoresFiltrados.length === 0 && (
              <div className="empty-state">
                <i className="fa-solid fa-truck-slash"></i>
                <p>No se encontraron proveedores</p>
              </div>
            )}
          </div>
        </main>
        
        <Footer />
      </div>

      {/* Modal de edición */}
      {modalAbierto && proveedorSeleccionado && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Proveedor</h3>
              <button className="modal-close" onClick={cerrarModal}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="user-details-card">
                <div className="user-avatar-large">
                  {proveedorSeleccionado.nombre.substring(0, 2).toUpperCase()}
                </div>
                <h4>{proveedorSeleccionado.nombre}</h4>
                <p className="user-email">{proveedorSeleccionado.email || 'Sin email'}</p>
                
                <div className="user-badges">
                  <span className={`badge ${proveedorSeleccionado.activo ? 'badge-activo' : 'badge-inactivo'}`}>
                    {proveedorSeleccionado.activo ? 'ACTIVO' : 'INACTIVO'}
                  </span>
                </div>
              </div>

              <div className="form-section">
                <label>ID del Proveedor</label>
                <input 
                  type="text" 
                  value={proveedorSeleccionado.id} 
                  disabled 
                  className="input-disabled"
                />
              </div>

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

              <div className="form-grid">
                <div className="form-section">
                  <label>Email</label>
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

              <div className="form-grid">
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
                  <span>Proveedor Activo</span>
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
                onClick={() => eliminar(proveedorSeleccionado.id)}
              >
                <i className="fa-solid fa-trash"></i>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de nuevo proveedor */}
      {modalNuevo && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nuevo Proveedor</h3>
              <button className="modal-close" onClick={cerrarModal}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
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

              <div className="form-grid">
                <div className="form-section">
                  <label>Email</label>
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

              <div className="form-grid">
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
                  <span>Proveedor Activo</span>
                </label>
              </div>

              <div className="form-section">
                <button 
                  className="btn btn-primary btn-full"
                  onClick={crearProveedor}
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