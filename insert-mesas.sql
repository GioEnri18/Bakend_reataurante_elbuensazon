-- Script para insertar 20 mesas con diferentes características
-- Ejecutar en phpMyAdmin o MySQL Workbench

USE examen_final;

-- Limpiar tabla de mesas si existe data
-- TRUNCATE TABLE mesas;

-- Insertar 20 mesas variadas
INSERT INTO mesas (numero, capacidad, ubicacion, activa) VALUES
-- Terraza (8 mesas)
(1, 2, 'Terraza principal', 1),
(2, 2, 'Terraza principal', 1),
(3, 4, 'Terraza principal', 1),
(4, 4, 'Terraza principal', 1),
(5, 6, 'Terraza vista', 1),
(6, 6, 'Terraza vista', 1),
(7, 8, 'Terraza VIP', 1),
(8, 4, 'Terraza esquina', 1),

-- Interior Salón Principal (6 mesas)
(9, 2, 'Salón principal', 1),
(10, 2, 'Salón principal', 1),
(11, 4, 'Salón principal', 1),
(12, 4, 'Salón principal', 1),
(13, 6, 'Salón principal', 1),
(14, 8, 'Salón principal', 1),

-- Área Privada (4 mesas)
(15, 4, 'Salón privado', 1),
(16, 6, 'Salón privado', 1),
(17, 8, 'Salón privado VIP', 1),
(18, 10, 'Salón privado VIP', 1),

-- Bar (2 mesas)
(19, 2, 'Área de bar', 1),
(20, 4, 'Área de bar', 1);

-- Verificar la inserción
SELECT COUNT(*) as total_mesas FROM mesas;
SELECT * FROM mesas ORDER BY numero;
