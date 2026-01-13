// src/pages/Empleados.jsx
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Subheader from '../components/Subheader';
import Footer from '../components/Footer';
import Swal from 'sweetalert2';
import '../styles/dashboard.css';
import '../styles/empleados.css';

export default function Empleados() {
  const [empleados, setEmpleados] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status] = useState('ok');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalNuevo, setModalNuevo] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [filtro, setFiltro] = useState('TODOS');
  const [busqueda, setBusqueda] = useState('');
  const [formData, setFormData] = useState({ 
    nombre: '', 
    email: '', 
    passwordHash: '',
    rol: 'VENDEDOR',
    estado: 'ACTIVO'
  });

  const rol = localStorage.getItem('rol');
  const nombre = localStorage.getItem('nombre');

  const cargar = async () => {
    try {
      const res = await api.get('/empleados');
      setEmpleados(res.data);
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar empleados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const aprobar = async (id) => {
    try {
      await api.post(`/empleados/${id}/aprobar`);
      setEmpleados(u => u.map(x => x.id === id ? { ...x, estado: 'ACTIVO' } : x));
      cerrarModal();
    } catch (err) { 
      console.log(err);
      setError('No se pudo aprobar empleado');
    }
  };

  const rechazar = async (id) => {
    try {
      await api.post(`/empleados/${id}/rechazar`);
      setEmpleados(u => u.map(x => x.id === id ? { ...x, estado: 'INACTIVO' } : x));
      cerrarModal();
    } catch (err) { 
      console.log(err); 
      setError('No se pudo rechazar empleado');
    }
  };

  const eliminar = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar empleado?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/empleados/${id}`);
      setEmpleados(u => u.filter(x => x.id !== id));
      cerrarModal();
      Swal.fire({
        icon: 'success',
        title: 'Eliminado',
        text: 'El empleado fue eliminado.',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) { 
      console.log(err); 
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el empleado.',
      });

    }
  };

  const abrirModal = (empleado) => {
    setEmpleadoSeleccionado(empleado);
    setFormData({ 
      nombre: empleado.nombre, 
      email: empleado.email,
      passwordHash: '',
      rol: empleado.rol,
      estado: empleado.estado
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setModalNuevo(false);
    setEmpleadoSeleccionado(null);
    setFormData({ 
      nombre: '', 
      email: '', 
      passwordHash: '',
      rol: 'VENDEDOR',
      estado: 'ACTIVO'
    });
  };

  const abrirModalNuevo = () => {
    setFormData({ 
      nombre: '', 
      email: '', 
      passwordHash: '',
      rol: 'VENDEDOR',
      estado: 'ACTIVO'
    });
    setModalNuevo(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      const payload = {
        nombre: formData.nombre,
        email: formData.email,
        rol: formData.rol,
        estado: formData.estado
      };
      
      // Solo incluir password si se proporcionó
      if (formData.passwordHash) {
        payload.passwordHash = formData.passwordHash;
      }

      await api.put(`/empleados/${empleadoSeleccionado.id}`, payload);

      setEmpleados(u => u.map(x => 
        x.id === empleadoSeleccionado.id 
          ? { ...x, ...payload } 
          : x
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

  const crearEmpleado = async () => {
    if (!formData.nombre || !formData.email || !formData.passwordHash) {
       Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completa todos los campos obligatorios',
      });
      return;
    }

    const result = await Swal.fire({
      title: '¿Crear empleado?',
      text: `¿Deseas crear al empleado ${formData.nombre}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Crear',
      cancelButtonText: 'Cancelar',
    });


    if (!result.isConfirmed) return;

    try {
      const res = await api.post('/empleados', formData);
      setEmpleados([...empleados, res.data]);
      cerrarModal();
      await Swal.fire({
        icon: 'success',
        title: 'Empleado creado',
        text: 'El empleado fue creado correctamente.',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.log(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear el empleado.',
      });
    }
  };

  const empleadosFiltrados = empleados.filter(u => {
    const coincideBusqueda = u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                             u.email.toLowerCase().includes(busqueda.toLowerCase());
    const coincideFiltro = filtro === 'TODOS' || u.estado === filtro;
    return coincideBusqueda && coincideFiltro;
  });

  const getEstadoBadgeClass = (estado) => {
    switch(estado) {
      case 'ACTIVO': return 'badge-activo';
      case 'INACTIVO': return 'badge-inactivo';
      case 'PENDIENTE': return 'badge-pendiente';
      default: return 'badge-default';
    }
  };

  const getRolBadgeClass = (rolEmpleado) => {
    switch(rolEmpleado) {
      case 'ADMIN': return 'badge-admin';
      case 'PRICING': return 'badge-pricing';
      case 'VENDEDOR': return 'badge-vendedor';
      default: return 'badge-default';
    }
  };

  const contadores = {
    total: empleados.length,
    activos: empleados.filter(u => u.estado === 'ACTIVO').length,
    pendientes: empleados.filter(u => u.estado === 'PENDIENTE').length,
    inactivos: empleados.filter(u => u.estado === 'INACTIVO').length,
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
              <p>Cargando empleados...</p>
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
          titulo="Gestión de Empleados"
          busqueda={busqueda}
          onBusquedaChange={setBusqueda}
          filtro={filtro}
          onFiltroChange={setFiltro}
          filtros={[
            { valor: 'TODOS', label: 'Todos' },
            { valor: 'ACTIVO', label: 'Activos' },
            { valor: 'PENDIENTE', label: 'Pendientes' },
            { valor: 'INACTIVO', label: 'Inactivos' }
          ]}
          onAgregarClick={abrirModalNuevo}
        />
        
        <main className="main-panel">
          {/* Información del sistema */}
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
                <i className="fa-solid fa-users"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{contadores.total}</div>
                <div className="stat-label">Total Empleados</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-activos">
                <i className="fa-solid fa-user-check"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{contadores.activos}</div>
                <div className="stat-label">Activos</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-pendientes">
                <i className="fa-solid fa-clock"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{contadores.pendientes}</div>
                <div className="stat-label">Pendientes</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-inactivos">
                <i className="fa-solid fa-user-slash"></i>
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
                  <th>Empleado</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {empleadosFiltrados.map(empleado => (
                  <tr key={empleado.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar-small">
                          {empleado.nombre.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="user-name-text">{empleado.nombre}</span>
                      </div>
                    </td>
                    <td>{empleado.email}</td>
                    <td>
                      <span className={`badge ${getRolBadgeClass(empleado.rol)}`}>
                        {empleado.rol}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getEstadoBadgeClass(empleado.estado)}`}>
                        {empleado.estado}
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
                                abrirModal(empleado);
                              }}
                            >
                              <i className="fa-solid fa-eye text-purple me-2"></i>
                              Ver Detalles
                            </button>
                          </li>

                          {empleado.estado === 'PENDIENTE' && (
                            <li>
                              <button
                                className="dropdown-item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  aprobar(empleado.id);
                                }}
                              >
                                <i className="fa-solid fa-check text-purple me-2"></i>
                                Aprobar
                              </button>
                            </li>
                          )}

                          {empleado.estado === 'ACTIVO' && (
                            <li>
                              <button
                                className="dropdown-item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  rechazar(empleado.id);
                                }}
                              >
                                <i className="fa-solid fa-ban text-purple me-2"></i>
                                Desactivar
                              </button>
                            </li>
                          )}

                          <li><hr className="dropdown-divider" /></li>

                          <li>
                            <button
                              className="dropdown-item text-danger"
                              onClick={(e) => {
                                e.stopPropagation();
                                eliminar(empleado.id);
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

            {empleadosFiltrados.length === 0 && (
              <div className="empty-state">
                <i className="fa-solid fa-users-slash"></i>
                <p>No se encontraron empleados</p>
              </div>
            )}
          </div>
        </main>
        
        <Footer />
      </div>

      {/* Modal de edición */}
      {modalAbierto && empleadoSeleccionado && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Empleado</h3>
              <button className="modal-close" onClick={cerrarModal}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="user-details-card">
                <div className="user-avatar-large">
                  {empleadoSeleccionado.nombre.substring(0, 2).toUpperCase()}
                </div>
                <h4>{empleadoSeleccionado.nombre}</h4>
                <p className="user-email">{empleadoSeleccionado.email}</p>
                
                <div className="user-badges">
                  <span className={`badge ${getRolBadgeClass(empleadoSeleccionado.rol)}`}>
                    {empleadoSeleccionado.rol}
                  </span>
                  <span className={`badge ${getEstadoBadgeClass(empleadoSeleccionado.estado)}`}>
                    {empleadoSeleccionado.estado}
                  </span>
                </div>
              </div>

              <div className="form-section">
                <label>ID del Empleado</label>
                <input 
                  type="text" 
                  value={empleadoSeleccionado.id} 
                  disabled 
                  className="input-disabled"
                />
              </div>

              <div className="form-section">
                <label>Nombre Completo *</label>
                <input 
                  type="text" 
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="select-input"
                  placeholder="Ingrese el nombre completo"
                />
              </div>

              <div className="form-section">
                <label>Correo Electrónico *</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="select-input"
                  placeholder="Ingrese el correo electrónico"
                />
              </div>

              <div className="form-section">
                <label>Nueva Contraseña (opcional)</label>
                <input 
                  type="password" 
                  name="passwordHash"
                  value={formData.passwordHash}
                  onChange={handleInputChange}
                  className="select-input"
                  placeholder="Dejar en blanco para mantener la actual"
                />
              </div>

              <div className="form-section">
                <label>Rol</label>
                <select 
                  name="rol"
                  value={formData.rol} 
                  onChange={handleInputChange}
                  className="select-input"
                >
                  <option value="VENDEDOR">VENDEDOR</option>
                  <option value="PRICING">PRICING</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="form-section">
                <label>Estado</label>
                <select 
                  name="estado"
                  value={formData.estado} 
                  onChange={handleInputChange}
                  className="select-input"
                >
                  <option value="ACTIVO">ACTIVO</option>
                  <option value="INACTIVO">INACTIVO</option>
                  <option value="PENDIENTE">PENDIENTE</option>
                </select>
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
                onClick={() => eliminar(empleadoSeleccionado.id)}
              >
                <i className="fa-solid fa-trash"></i>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de nuevo empleado */}
      {modalNuevo && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nuevo Empleado</h3>
              <button className="modal-close" onClick={cerrarModal}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="form-section">
                <label>Nombre Completo *</label>
                <input 
                  type="text" 
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="select-input"
                  placeholder="Ingrese el nombre completo"
                />
              </div>

              <div className="form-section">
                <label>Correo Electrónico *</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="select-input"
                  placeholder="Ingrese el correo electrónico"
                />
              </div>

              <div className="form-section">
                <label>Contraseña *</label>
                <input 
                  type="password" 
                  name="passwordHash"
                  value={formData.passwordHash}
                  onChange={handleInputChange}
                  className="select-input"
                  placeholder="Ingrese una contraseña"
                />
              </div>

              <div className="form-section">
                <label>Rol</label>
                <select 
                  name="rol"
                  value={formData.rol} 
                  onChange={handleInputChange}
                  className="select-input"
                >
                  <option value="VENDEDOR">VENDEDOR</option>
                  <option value="PRICING">PRICING</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="form-section">
                <label>Estado</label>
                <select 
                  name="estado"
                  value={formData.estado} 
                  onChange={handleInputChange}
                  className="select-input"
                >
                  <option value="ACTIVO">ACTIVO</option>
                  <option value="INACTIVO">INACTIVO</option>
                  <option value="PENDIENTE">PENDIENTE</option>
                </select>
              </div>

              <div className="form-section">
                <button 
                  className="btn btn-primary btn-full"
                  onClick={crearEmpleado}
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