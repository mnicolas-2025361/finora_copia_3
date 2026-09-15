import { pool } from "./database.js";

async function createUsersTable() {
    try {
        await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(150) UNIQUE NOT NULL,
            password TEXT,
            role VARCHAR(20) NOT NULL DEFAULT 'USER',
            google_id VARCHAR(255) UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `);

        // Por si la tabla ya existía de antes de este cambio:
        await pool.query(`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;
        `);

        await pool.query(`
        ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
        `);

        console.log("Tabla users creada/actualizada correctamente.");
    } catch (error) {
        console.error("Error al crear la tabla users:", error);
    } finally {
        await pool.end();
    }
    }

createUsersTable();