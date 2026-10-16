-- =====================================================================
-- 1. MÓDULO DE ACCESOS Y USUARIOS
-- =====================================================================

CREATE TABLE roles (
  id_rol        TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(40)  NOT NULL UNIQUE,
  descripcion   VARCHAR(150)
) ENGINE=InnoDB; /*[cite: 1] */

CREATE TABLE usuarios (
  id_usuario         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_rol             TINYINT UNSIGNED NOT NULL,
  nombres            VARCHAR(80)  NOT NULL,
  apellidos          VARCHAR(80)  NOT NULL,
  email              VARCHAR(120) NOT NULL UNIQUE,
  password_hash      VARCHAR(255) NOT NULL,
  activo             BOOLEAN      NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
) ENGINE=InnoDB; /*[cite: 1] */

CREATE TABLE clientes (
  id_cliente           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tipo_documento       ENUM('DNI','RUC','CE','PASAPORTE','SIN_DOC') NOT NULL DEFAULT 'DNI',
  numero_documento     VARCHAR(15)  NOT NULL,
  nombres_razon_social VARCHAR(150) NOT NULL,
  telefono             VARCHAR(20),
  email                VARCHAR(120),
  UNIQUE KEY uk_cliente_doc (tipo_documento, numero_documento)
) ENGINE=InnoDB; /*[cite: 1] */


-- =====================================================================
-- 2. MÓDULO DE INVENTARIO (Core del Sistema)
-- =====================================================================

CREATE TABLE categorias (
  id_categoria  SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(60)  NOT NULL UNIQUE,
  descripcion   VARCHAR(150)
) ENGINE=InnoDB; /*[cite: 1] */

CREATE TABLE proveedores (
  id_proveedor  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ruc           CHAR(11)     NOT NULL UNIQUE,
  razon_social  VARCHAR(150) NOT NULL,
  contacto      VARCHAR(100),
  telefono      VARCHAR(20)
) ENGINE=InnoDB; /*[cite: 1] */

CREATE TABLE productos (
  id_producto      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo_barras    VARCHAR(30)  NOT NULL UNIQUE,
  nombre           VARCHAR(120) NOT NULL,
  principio_activo VARCHAR(120),
  id_categoria     SMALLINT UNSIGNED NOT NULL,
  -- En el script original se usa id_laboratorio, se adapta aquí como id_proveedor 
  id_proveedor     INT UNSIGNED, 
  precio_compra    DECIMAL(10,2) NOT NULL DEFAULT 0,
  precio_venta     DECIMAL(10,2) NOT NULL,
  stock_actual     INT NOT NULL DEFAULT 0,
  stock_minimo     INT NOT NULL DEFAULT 10,
  requiere_receta  BOOLEAN NOT NULL DEFAULT FALSE,
  activo           BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_prod_categoria FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria),
  CONSTRAINT fk_prod_proveedor FOREIGN KEY (id_proveedor) REFERENCES proveedores(id_proveedor)
) ENGINE=InnoDB; /*[cite: 1] */


-- =====================================================================
-- 3. MÓDULO DE TRANSACCIONES (Ventas e Ingresos)
-- =====================================================================

CREATE TABLE ventas (
  id_venta              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_cliente            INT UNSIGNED NOT NULL,
  id_usuario            INT UNSIGNED NOT NULL,
  tipo_comprobante      ENUM('BOLETA','FACTURA','TICKET') NOT NULL DEFAULT 'BOLETA',
  numero_comprobante    INT UNSIGNED NOT NULL,
  fecha_venta           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  igv                   DECIMAL(12,2) NOT NULL DEFAULT 0,
  total                 DECIMAL(12,2) NOT NULL DEFAULT 0,
  metodo_pago           VARCHAR(30), 
  CONSTRAINT fk_venta_cliente FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
  CONSTRAINT fk_venta_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB; /*[cite: 1] */

CREATE TABLE detalle_venta (
  id_detalle_venta INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_venta         INT UNSIGNED NOT NULL,
  id_producto      INT UNSIGNED NOT NULL,
  cantidad         INT NOT NULL,
  precio_unitario  DECIMAL(10,2) NOT NULL,
  subtotal         DECIMAL(12,2) NOT NULL DEFAULT 0,
  CONSTRAINT fk_dv_venta    FOREIGN KEY (id_venta)    REFERENCES ventas(id_venta) ON DELETE CASCADE,
  CONSTRAINT fk_dv_producto FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
) ENGINE=InnoDB; /*[cite: 1] */

-- Llamada 'compras' en el script original para los ingresos de inventario
CREATE TABLE ingresos_inventario (
  id_compra        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_proveedor     INT UNSIGNED NOT NULL,
  id_usuario       INT UNSIGNED NOT NULL,
  numero_documento VARCHAR(20)  NOT NULL,
  fecha_compra     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total            DECIMAL(12,2) NOT NULL DEFAULT 0,
  CONSTRAINT fk_compra_proveedor FOREIGN KEY (id_proveedor) REFERENCES proveedores(id_proveedor),
  CONSTRAINT fk_compra_usuario   FOREIGN KEY (id_usuario)   REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB; /*[cite: 1] */

-- Llamada 'detalle_compra' en el script original
CREATE TABLE detalle_ingresos (
  id_detalle_compra INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_compra         INT UNSIGNED NOT NULL,
  id_producto       INT UNSIGNED NOT NULL,
  fecha_vencimiento DATE         NOT NULL,
  cantidad          INT          NOT NULL,
  costo_unitario    DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_dc_compra   FOREIGN KEY (id_compra)   REFERENCES ingresos_inventario(id_compra) ON DELETE CASCADE,
  CONSTRAINT fk_dc_producto FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
) ENGINE=InnoDB; /*[cite: 1] */