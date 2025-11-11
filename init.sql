-- Script de inicialización para la base de datos
USE examen_final;

-- Configurar zona horaria
SET time_zone = '-06:00';

-- Configurar horarios laborales por defecto
CREATE TABLE IF NOT EXISTS configuracion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hora_inicio TIME DEFAULT '08:00:00',
    hora_fin TIME DEFAULT '22:00:00',
    dias_laborales JSON DEFAULT '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO configuracion (hora_inicio, hora_fin) VALUES ('08:00:00', '22:00:00');