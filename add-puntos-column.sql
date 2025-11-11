-- Agregar columna puntos a la tabla clientes
ALTER TABLE clientes ADD COLUMN puntos INT DEFAULT 0;

-- Actualizar todos los clientes existentes con 0 puntos
UPDATE clientes SET puntos = 0 WHERE puntos IS NULL;
