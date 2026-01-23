// src/components/FormField.jsx

/**
 * Componente de campo de formulario genérico
 * 
 * @param {String} type - Tipo de campo (text, email, select, checkbox, textarea)
 * @param {String} label - Etiqueta del campo
 * @param {String} name - Nombre del campo
 * @param {any} value - Valor del campo
 * @param {Function} onChange - Función onChange
 * @param {Array} options - Opciones para select
 * @param {Boolean} required - Campo obligatorio
 * @param {Boolean} disabled - Campo deshabilitado
 * @param {String} placeholder - Placeholder
 */
export default function FormField({
  type = 'text',
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  disabled = false,
  placeholder = '',
  rows = 3
}) {
  const handleChange = (e) => {
    if (type === 'checkbox') {
      onChange({ target: { name, value: e.target.checked, type: 'checkbox', checked: e.target.checked } });
    } else {
      onChange(e);
    }
  };

  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <select
            name={name}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            className="select-input"
          >
            {options.map((opt, idx) => (
              <option key={idx} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            name={name}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            placeholder={placeholder}
            className="form-textarea"
            rows={rows}
          />
        );

      case 'checkbox':
        return (
          <label className="checkbox-label">
            <input
              type="checkbox"
              name={name}
              checked={value}
              onChange={handleChange}
              disabled={disabled}
              className="checkbox-input"
            />
            <span>{label}</span>
          </label>
        );

      default:
        return (
          <input
            type={type}
            name={name}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            placeholder={placeholder}
            className={disabled ? 'input-disabled' : 'select-input'}
          />
        );
    }
  };

  if (type === 'checkbox') {
    return <div className="form-section">{renderInput()}</div>;
  }

  return (
    <div className="form-section">
      {label && (
        <label className={required ? 'required-field' : ''}>
          {label}
        </label>
      )}
      {renderInput()}
    </div>
  );
}