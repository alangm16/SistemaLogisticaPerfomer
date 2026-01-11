-- Empleado: usuarios con roles
CREATE TABLE empleado (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('VENDEDOR','PRICING','ADMIN') NOT NULL,
  estado ENUM('ACTIVO','INACTIVO','PENDIENTE') NOT NULL DEFAULT 'PENDIENTE',
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Cliente
CREATE TABLE cliente (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(160) NOT NULL,
  rfc VARCHAR(20),
  email VARCHAR(160),
  telefono VARCHAR(30),
  direccion VARCHAR(255),
  ciudad VARCHAR(120),
  pais VARCHAR(120),
  codigo_postal VARCHAR(20),
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Proveedor
CREATE TABLE proveedor (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(160) NOT NULL,
  email VARCHAR(160),
  telefono VARCHAR(30),
  pais VARCHAR(120),
  ciudad VARCHAR(120),
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Folio: secuencias por empresa/año
CREATE TABLE folio (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  empresa_codigo VARCHAR(10) NOT NULL,     -- PER, KLI, GAM, etc.
  anio INT NOT NULL,
  consecutivo INT NOT NULL,
  UNIQUE KEY uk_folio (empresa_codigo, anio)
);

-- Solicitud
CREATE TABLE solicitud (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  folio_codigo VARCHAR(30) NOT NULL UNIQUE, -- PER-00001-2025
  empresa_codigo VARCHAR(10) NOT NULL,
  fecha_emision DATE NOT NULL,
  cliente_id BIGINT NOT NULL,
  tipo_servicio ENUM('TERRESTRE','MARITIMO','AEREO','MULTIMODAL','EXCESO_DIMENSIONES') NOT NULL,
  origen_pais VARCHAR(120) NOT NULL,
  origen_ciudad VARCHAR(120) NOT NULL,
  origen_direccion VARCHAR(255),
  origen_cp VARCHAR(20),
  destino_pais VARCHAR(120) NOT NULL,
  destino_ciudad VARCHAR(120) NOT NULL,
  destino_direccion VARCHAR(255),
  destino_cp VARCHAR(20),
  cantidad INT NOT NULL DEFAULT 1,
  largo_cm DECIMAL(10,2),
  ancho_cm DECIMAL(10,2),
  alto_cm DECIMAL(10,2),
  peso_kg DECIMAL(10,2),
  apilable BOOLEAN,
  valor_declarado_usd DECIMAL(12,2),
  tipo_empaque VARCHAR(80),
  material_peligroso BOOLEAN,
  estado ENUM('PENDIENTE','ENVIADO','COMPLETADO','CANCELADO') NOT NULL DEFAULT 'PENDIENTE',
  asignado_a BIGINT,                         -- empleado_id
  creado_por BIGINT NOT NULL,                -- empleado_id
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES cliente(id),
  FOREIGN KEY (asignado_a) REFERENCES empleado(id),
  FOREIGN KEY (creado_por) REFERENCES empleado(id)
);

-- Cotización
CREATE TABLE cotizacion (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  solicitud_id BIGINT NOT NULL,
  proveedor_id BIGINT NOT NULL,
  tipo_transporte ENUM('TERRESTRE','MARITIMO','AEREO') NOT NULL,
  origen VARCHAR(160) NOT NULL,
  destino VARCHAR(160) NOT NULL,
  tipo_unidad VARCHAR(120),                 -- Trailer, Torton, Contenedor 40HQ, etc.
  tiempo_estimado VARCHAR(80),              -- '3-5 días'
  costo DECIMAL(14,2) NOT NULL,
  valido_hasta DATE,
  dias_credito INT,
  margen_ganancia_pct DECIMAL(5,2),         -- se usará en Sprint 12
  estado ENUM('PENDIENTE','ENVIADO','COMPLETADO','CANCELADO') NOT NULL DEFAULT 'PENDIENTE',
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (solicitud_id) REFERENCES solicitud(id),
  FOREIGN KEY (proveedor_id) REFERENCES proveedor(id)
);

-- Historial (de cambios y auditoría)
CREATE TABLE historial (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  entidad_tipo ENUM('SOLICITUD','COTIZACION','USUARIO') NOT NULL,
  entidad_id BIGINT NOT NULL,
  accion VARCHAR(80) NOT NULL,              -- e.g., 'CREADO','ESTADO_CAMBIADO','ASIGNADO'
  detalle TEXT,                             -- JSON/text con cambios
  usuario_id BIGINT NOT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES empleado(id)
);

-- Correo (registro de emails enviados)
CREATE TABLE correo (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  solicitud_id BIGINT,
  cotizacion_id BIGINT,
  destinatario VARCHAR(160) NOT NULL,
  asunto VARCHAR(160) NOT NULL,
  cuerpo TEXT NOT NULL,
  enviado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (solicitud_id) REFERENCES solicitud(id),
  FOREIGN KEY (cotizacion_id) REFERENCES cotizacion(id)
);
