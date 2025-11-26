-- ========================================
-- DATOS DE EJEMPLO PARA SISTEMA FINANCIERO
-- ========================================

\c finanzas;

-- ========================================
-- 1. USUARIOS DE PRUEBA
-- ========================================

-- Contraseña para todos los usuarios: "password123"
-- Hash bcrypt de "password123": $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIr.TjZBOy

INSERT INTO usuarios (username, password_hash, nombre_completo, email, fecha_registro) VALUES
('demo', '$2b$12$vK6hnQV4LqIPTp8cKktqKunnyz2FGvJ7igBP3fQIyCnUUXXj.B8XW.', 'Usuario Demo', 'demo@finanzas.com', EXTRACT(EPOCH FROM NOW())::BIGINT),
('maria.garcia', '$2b$12$vK6hnQV4LqIPTp8cKktqKunnyz2FGvJ7igBP3fQIyCnUUXXj.B8XW.', 'María García', 'maria.garcia@email.com', EXTRACT(EPOCH FROM NOW())::BIGINT),
('juan.perez', '$2b$12$vK6hnQV4LqIPTp8cKktqKunnyz2FGvJ7igBP3fQIyCnUUXXj.B8XW.', 'Juan Pérez', 'juan.perez@email.com', EXTRACT(EPOCH FROM NOW())::BIGINT);


-- ========================================
-- 2. CATEGORÍAS
-- ========================================

-- Categorías de GASTOS para usuario demo (id=1)
INSERT INTO categorias (usuarioId, nombre, tipo, descripcion, fecha) VALUES
(1, 'Alimentación', 'gasto', 'Supermercado, restaurantes, comida', EXTRACT(EPOCH FROM NOW())::BIGINT),
(1, 'Transporte', 'gasto', 'Gasolina, transporte público, Uber', EXTRACT(EPOCH FROM NOW())::BIGINT),
(1, 'Vivienda', 'gasto', 'Renta, servicios, mantenimiento', EXTRACT(EPOCH FROM NOW())::BIGINT),
(1, 'Entretenimiento', 'gasto', 'Cine, streaming, salidas', EXTRACT(EPOCH FROM NOW())::BIGINT),
(1, 'Salud', 'gasto', 'Médico, farmacia, seguro', EXTRACT(EPOCH FROM NOW())::BIGINT),
(1, 'Educación', 'gasto', 'Cursos, libros, material', EXTRACT(EPOCH FROM NOW())::BIGINT),
(1, 'Ropa', 'gasto', 'Vestimenta y accesorios', EXTRACT(EPOCH FROM NOW())::BIGINT),
(1, 'Otros Gastos', 'gasto', 'Gastos varios', EXTRACT(EPOCH FROM NOW())::BIGINT);

-- Categorías de INGRESOS para usuario demo (id=1)
INSERT INTO categorias (usuarioId, nombre, tipo, descripcion, fecha) VALUES
(1, 'Salario', 'ingreso', 'Sueldo mensual', EXTRACT(EPOCH FROM NOW())::BIGINT),
(1, 'Freelance', 'ingreso', 'Trabajos independientes', EXTRACT(EPOCH FROM NOW())::BIGINT),
(1, 'Inversiones', 'ingreso', 'Rendimientos de inversiones', EXTRACT(EPOCH FROM NOW())::BIGINT),
(1, 'Otros Ingresos', 'ingreso', 'Ingresos varios', EXTRACT(EPOCH FROM NOW())::BIGINT);


-- ========================================
-- 3. MÉTODOS DE PAGO
-- ========================================

INSERT INTO metodos_pago (usuarioId, datos) VALUES
(1, ROW('Efectivo', 'Dinero en efectivo')::metodo_pago_info),
(1, ROW('Tarjeta Débito', 'Tarjeta de débito principal')::metodo_pago_info),
(1, ROW('Tarjeta Crédito', 'Tarjeta de crédito VISA')::metodo_pago_info),
(1, ROW('Transferencia', 'Transferencia bancaria')::metodo_pago_info),
(1, ROW('PayPal', 'Cuenta PayPal')::metodo_pago_info);


-- ========================================
-- 4. GASTOS (Últimos 30 días)
-- ========================================

-- Gastos de hace 25 días
INSERT INTO gastos (usuarioId, categoriaId, monto, metodo_pago, detalle, descripcion, fecha) VALUES
(1, 1, ROW(1250.50, 'MXN')::monto, 'Tarjeta Débito', 'Supermercado Walmart', 'Despensa semanal', EXTRACT(EPOCH FROM (NOW() - INTERVAL '25 days'))::BIGINT),
(1, 2, ROW(350.00, 'MXN')::monto, 'Efectivo', 'Gasolina', 'Tanque lleno', EXTRACT(EPOCH FROM (NOW() - INTERVAL '25 days'))::BIGINT);

-- Gastos de hace 20 días
INSERT INTO gastos (usuarioId, categoriaId, monto, metodo_pago, detalle, descripcion, fecha) VALUES
(1, 3, ROW(8500.00, 'MXN')::monto, 'Transferencia', 'Renta mensual', 'Pago de renta de departamento', EXTRACT(EPOCH FROM (NOW() - INTERVAL '20 days'))::BIGINT),
(1, 4, ROW(299.00, 'MXN')::monto, 'Tarjeta Crédito', 'Netflix', 'Suscripción mensual', EXTRACT(EPOCH FROM (NOW() - INTERVAL '20 days'))::BIGINT),
(1, 4, ROW(450.00, 'MXN')::monto, 'Tarjeta Débito', 'Cine', 'Boletos y palomitas', EXTRACT(EPOCH FROM (NOW() - INTERVAL '20 days'))::BIGINT);

-- Gastos de hace 15 días
INSERT INTO gastos (usuarioId, categoriaId, monto, metodo_pago, detalle, descripcion, fecha) VALUES
(1, 1, ROW(850.00, 'MXN')::monto, 'Tarjeta Débito', 'Restaurante', 'Cena con amigos', EXTRACT(EPOCH FROM (NOW() - INTERVAL '15 days'))::BIGINT),
(1, 2, ROW(120.00, 'MXN')::monto, 'Efectivo', 'Uber', 'Transporte al trabajo', EXTRACT(EPOCH FROM (NOW() - INTERVAL '15 days'))::BIGINT),
(1, 5, ROW(450.00, 'MXN')::monto, 'Efectivo', 'Farmacia', 'Medicamentos', EXTRACT(EPOCH FROM (NOW() - INTERVAL '15 days'))::BIGINT);

-- Gastos de hace 10 días
INSERT INTO gastos (usuarioId, categoriaId, monto, metodo_pago, detalle, descripcion, fecha) VALUES
(1, 1, ROW(1100.00, 'MXN')::monto, 'Tarjeta Débito', 'Supermercado', 'Despensa semanal', EXTRACT(EPOCH FROM (NOW() - INTERVAL '10 days'))::BIGINT),
(1, 6, ROW(599.00, 'MXN')::monto, 'PayPal', 'Curso Udemy', 'Curso de programación', EXTRACT(EPOCH FROM (NOW() - INTERVAL '10 days'))::BIGINT),
(1, 2, ROW(400.00, 'MXN')::monto, 'Efectivo', 'Gasolina', 'Media carga', EXTRACT(EPOCH FROM (NOW() - INTERVAL '10 days'))::BIGINT);

-- Gastos de hace 5 días
INSERT INTO gastos (usuarioId, categoriaId, monto, metodo_pago, detalle, descripcion, fecha) VALUES
(1, 7, ROW(1299.00, 'MXN')::monto, 'Tarjeta Crédito', 'Zapatos', 'Zapatos deportivos', EXTRACT(EPOCH FROM (NOW() - INTERVAL '5 days'))::BIGINT),
(1, 1, ROW(250.00, 'MXN')::monto, 'Efectivo', 'Café', 'Cafetería Starbucks', EXTRACT(EPOCH FROM (NOW() - INTERVAL '5 days'))::BIGINT),
(1, 4, ROW(199.00, 'MXN')::monto, 'Tarjeta Crédito', 'Spotify', 'Suscripción mensual', EXTRACT(EPOCH FROM (NOW() - INTERVAL '5 days'))::BIGINT);

-- Gastos de hace 2 días
INSERT INTO gastos (usuarioId, categoriaId, monto, metodo_pago, detalle, descripcion, fecha) VALUES
(1, 1, ROW(980.00, 'MXN')::monto, 'Tarjeta Débito', 'Supermercado', 'Compras varias', EXTRACT(EPOCH FROM (NOW() - INTERVAL '2 days'))::BIGINT),
(1, 2, ROW(85.00, 'MXN')::monto, 'Efectivo', 'Metro', 'Recarga tarjeta metro', EXTRACT(EPOCH FROM (NOW() - INTERVAL '2 days'))::BIGINT);

-- Gastos de hoy
INSERT INTO gastos (usuarioId, categoriaId, monto, metodo_pago, detalle, descripcion, fecha) VALUES
(1, 1, ROW(180.00, 'MXN')::monto, 'Efectivo', 'Desayuno', 'Desayuno en cafetería', EXTRACT(EPOCH FROM NOW())::BIGINT),
(1, 8, ROW(350.00, 'MXN')::monto, 'Tarjeta Débito', 'Varios', 'Artículos varios', EXTRACT(EPOCH FROM NOW())::BIGINT);


-- ========================================
-- 5. INGRESOS (Últimos 30 días)
-- ========================================

-- Ingreso de hace 30 días (salario)
INSERT INTO ingresos (usuarioId, categoriaId, monto, metodo_pago, fuente, descripcion, fecha) VALUES
(1, 9, ROW(25000.00, 'MXN')::monto, 'Transferencia', 'Salario Mensual', 'Pago de nómina empresa XYZ', EXTRACT(EPOCH FROM (NOW() - INTERVAL '30 days'))::BIGINT);

-- Ingresos de hace 15 días (freelance)
INSERT INTO ingresos (usuarioId, categoriaId, monto, metodo_pago, fuente, descripcion, fecha) VALUES
(1, 10, ROW(3500.00, 'MXN')::monto, 'PayPal', 'Proyecto Freelance', 'Desarrollo web para cliente', EXTRACT(EPOCH FROM (NOW() - INTERVAL '15 days'))::BIGINT),
(1, 10, ROW(2000.00, 'MXN')::monto, 'Transferencia', 'Consultoría', 'Asesoría técnica', EXTRACT(EPOCH FROM (NOW() - INTERVAL '15 days'))::BIGINT);

-- Ingreso de hace 7 días (inversiones)
INSERT INTO ingresos (usuarioId, categoriaId, monto, metodo_pago, fuente, descripcion, fecha) VALUES
(1, 11, ROW(850.00, 'MXN')::monto, 'Transferencia', 'Dividendos', 'Rendimiento de inversiones', EXTRACT(EPOCH FROM (NOW() - INTERVAL '7 days'))::BIGINT);

-- Ingreso de hace 3 días (otros)
INSERT INTO ingresos (usuarioId, categoriaId, monto, metodo_pago, fuente, descripcion, fecha) VALUES
(1, 12, ROW(500.00, 'MXN')::monto, 'Efectivo', 'Venta artículo', 'Venta de artículo usado', EXTRACT(EPOCH FROM (NOW() - INTERVAL '3 days'))::BIGINT);


-- ========================================
-- 6. PRESUPUESTOS
-- ========================================

INSERT INTO presupuestos (usuarioId, categoriaId, monto_max, periodo, fecha_creacion) VALUES
(1, 1, ROW(5000.00, 'MXN')::monto, 'mensual', EXTRACT(EPOCH FROM NOW())::BIGINT),  -- Alimentación
(1, 2, ROW(2000.00, 'MXN')::monto, 'mensual', EXTRACT(EPOCH FROM NOW())::BIGINT),  -- Transporte
(1, 4, ROW(1500.00, 'MXN')::monto, 'mensual', EXTRACT(EPOCH FROM NOW())::BIGINT),  -- Entretenimiento
(1, 7, ROW(2000.00, 'MXN')::monto, 'mensual', EXTRACT(EPOCH FROM NOW())::BIGINT);  -- Ropa


-- ========================================
-- 7. METAS DE AHORRO
-- ========================================

INSERT INTO metas (usuarioId, nombre, descripcion, monto_objetivo, monto_actual, fecha_limite) VALUES
(1, 'Vacaciones 2026', 'Viaje a Europa en verano', ROW(50000.00, 'MXN')::monto, ROW(12500.00, 'MXN')::monto, EXTRACT(EPOCH FROM '2026-06-01'::timestamp)::BIGINT),
(1, 'Fondo de Emergencia', 'Ahorro para emergencias (6 meses de gastos)', ROW(100000.00, 'MXN')::monto, ROW(35000.00, 'MXN')::monto, EXTRACT(EPOCH FROM '2026-12-31'::timestamp)::BIGINT),
(1, 'Laptop Nueva', 'MacBook Pro para trabajo', ROW(35000.00, 'MXN')::monto, ROW(18000.00, 'MXN')::monto, EXTRACT(EPOCH FROM '2026-03-01'::timestamp)::BIGINT),
(1, 'Auto', 'Enganche para auto nuevo', ROW(80000.00, 'MXN')::monto, ROW(25000.00, 'MXN')::monto, EXTRACT(EPOCH FROM '2027-01-01'::timestamp)::BIGINT);


-- ========================================
-- VERIFICACIÓN DE DATOS
-- ========================================

-- Mostrar resumen de datos insertados
DO $$
DECLARE
    total_usuarios INTEGER;
    total_categorias INTEGER;
    total_gastos INTEGER;
    total_ingresos INTEGER;
    total_presupuestos INTEGER;
    total_metas INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_usuarios FROM usuarios;
    SELECT COUNT(*) INTO total_categorias FROM categorias;
    SELECT COUNT(*) INTO total_gastos FROM gastos;
    SELECT COUNT(*) INTO total_ingresos FROM ingresos;
    SELECT COUNT(*) INTO total_presupuestos FROM presupuestos;
    SELECT COUNT(*) INTO total_metas FROM metas;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DATOS DE PRUEBA INSERTADOS CORRECTAMENTE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Usuarios: %', total_usuarios;
    RAISE NOTICE 'Categorías: %', total_categorias;
    RAISE NOTICE 'Gastos: %', total_gastos;
    RAISE NOTICE 'Ingresos: %', total_ingresos;
    RAISE NOTICE 'Presupuestos: %', total_presupuestos;
    RAISE NOTICE 'Metas de Ahorro: %', total_metas;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Usuario demo: username="demo", password="password123"';
    RAISE NOTICE '========================================';
END $$;

-- Mostrar balance del usuario demo
SELECT * FROM vista_balance_usuarios WHERE username = 'demo';
