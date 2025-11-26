----------------------------------------
-- SISTEMA DE GESTIÓN FINANCIERA PERSONAL
-- Script de Inicialización de Base de Datos
----------------------------------------

-- Eliminar base de datos si existe (para desarrollo)
DROP DATABASE IF EXISTS finanzas;
CREATE DATABASE finanzas;

-- Conectar a la base de datos
\c finanzas;

----------------------------------------
-- 1. TIPOS OBJETO
----------------------------------------

CREATE TYPE monto AS (
    cantidad REAL,
    moneda TEXT
);

-- Tipo compuesto para registro de fechas
CREATE TYPE fecha_registro AS (
    fecha BIGINT
);

-- Tipo ENUM para clasificar categorías
CREATE TYPE tipo_categoria AS ENUM ('gasto', 'ingreso');

-- Periodicidad
CREATE TYPE tipo_periodo AS ENUM ('mensual', 'semanal', 'anual');


----------------------------------------
-- 2. TABLA DE USUARIOS
----------------------------------------

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    nombre_completo TEXT,
    email TEXT,
    fecha_registro BIGINT NOT NULL
);


----------------------------------------
-- 3. TABLA PADRE: entidad_financiera
----------------------------------------

CREATE TABLE entidad_financiera (
    id SERIAL PRIMARY KEY,
    usuarioId INTEGER NOT NULL REFERENCES usuarios(id),
    descripcion TEXT,
    fecha BIGINT NOT NULL   -- fecha de creación o registro
);


----------------------------------------
-- 4. TABLA: categorias (hereda de entidad_financiera)
----------------------------------------
-- Aquí se almacenan categorías como "comida", "transporte", etc.

CREATE TABLE categorias (
    nombre TEXT NOT NULL,
    tipo tipo_categoria NOT NULL,
    UNIQUE (usuarioId, nombre),  -- evita duplicados por usuario
    PRIMARY KEY (id)
) INHERITS (entidad_financiera);


----------------------------------------
-- 5. TABLA: movimientos (padre de gastos e ingresos)
----------------------------------------

CREATE TABLE movimientos (
    categoriaId INTEGER NOT NULL REFERENCES categorias(id),
    monto monto NOT NULL,
    metodo_pago TEXT,
    CHECK (metodo_pago IS NOT NULL),
    PRIMARY KEY (id)
) INHERITS (entidad_financiera);


----------------------------------------
-- 6. TABLA: gastos (hereda de movimientos)
----------------------------------------

CREATE TABLE gastos (
    detalle TEXT DEFAULT 'Gasto',
    PRIMARY KEY (id)
) INHERITS (movimientos);


----------------------------------------
-- 7. TABLA: ingresos (hereda de movimientos)
----------------------------------------

CREATE TABLE ingresos (
    fuente TEXT DEFAULT 'Ingreso',
    PRIMARY KEY (id)
) INHERITS (movimientos);


----------------------------------------
-- 8. TABLA: métodos de pago
----------------------------------------

CREATE TYPE metodo_pago_info AS (
    nombre TEXT,
    descripcion TEXT
);

CREATE TABLE metodos_pago (
    id SERIAL PRIMARY KEY,
    usuarioId INTEGER NOT NULL REFERENCES usuarios(id),
    datos metodo_pago_info NOT NULL
);


----------------------------------------
-- 9. TABLA: presupuestos
----------------------------------------

CREATE TABLE presupuestos (
    id SERIAL PRIMARY KEY,
    usuarioId INTEGER NOT NULL REFERENCES usuarios(id),
    categoriaId INTEGER NOT NULL REFERENCES categorias(id),
    monto_max monto NOT NULL,
    periodo tipo_periodo NOT NULL,
    fecha_creacion BIGINT NOT NULL
);


----------------------------------------
-- 10. TABLA: metas de ahorro
----------------------------------------

CREATE TABLE metas (
    id SERIAL PRIMARY KEY,
    usuarioId INTEGER NOT NULL REFERENCES usuarios(id),
    nombre TEXT NOT NULL,
    descripcion TEXT,
    monto_objetivo monto NOT NULL,
    monto_actual monto NOT NULL,
    fecha_limite BIGINT
);

----------------------------------------
-- VISTAS NECESARIAS PARA LA APP
----------------------------------------

-- Vista para obtener el balance total por usuario
CREATE OR REPLACE VIEW vista_balance_usuarios AS
SELECT 
    u.id as usuario_id,
    u.username,
    COALESCE(SUM((i.monto).cantidad), 0) as total_ingresos,
    COALESCE(SUM((g.monto).cantidad), 0) as total_gastos,
    COALESCE(SUM((i.monto).cantidad), 0) - COALESCE(SUM((g.monto).cantidad), 0) as balance
FROM usuarios u
LEFT JOIN ingresos i ON u.id = i.usuarioId
LEFT JOIN gastos g ON u.id = g.usuarioId
GROUP BY u.id, u.username;
