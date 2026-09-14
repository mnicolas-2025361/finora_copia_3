import { pool } from "./database.js";

async function createIngresosTable() {
    try {
        await pool.query(`
        CREATE TABLE IF NOT EXISTS ingresos (
            id SERIAL PRIMARY KEY,
            usuario_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            descripcion VARCHAR(150) NOT NULL,
            monto NUMERIC(12,2) NOT NULL,
            fecha DATE NOT NULL DEFAULT CURRENT_DATE,
            categoria VARCHAR(50) NOT NULL DEFAULT 'General',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `);

        console.log("Tabla ingresos creada correctamente.");
    } catch (error) {
        console.error("Error al crear la tabla ingresos:", error);
    } finally {
        await pool.end();
    }
    }

createIngresosTable();