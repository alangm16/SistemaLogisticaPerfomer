// src/components/StatsGrid.jsx

/**
 * Componente para mostrar estadísticas en tarjetas
 * 
 * @param {Array} stats - Array de estadísticas
 * Cada stat: { label, value, icon, iconClass }
 */
export default function StatsGrid({ stats = [] }) {
  return (
    <div className="stats-grid">
      {stats.map((stat, idx) => (
        <div key={idx} className="stat-card">
          <div className={`stat-icon ${stat.iconClass || 'stat-icon-total'}`}>
            <i className={`fa-solid ${stat.icon}`}></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}