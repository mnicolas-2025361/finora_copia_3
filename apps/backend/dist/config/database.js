import "dotenv/config";
import { Pool } from "pg";
export const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectionTimeoutMillis: 5000, // máximo 5s para conectar, si no, error
    idleTimeoutMillis: 30000,
});
// Esto te avisa en consola si el pool pierde la conexión en cualquier momento
pool.on("error", (err) => {
    console.error("Error inesperado en el pool de PostgreSQL:", err);
});
// Prueba inmediata al arrancar: si la base no responde, lo verás YA en consola
pool.query("SELECT NOW()")
    .then(() => console.log("✅ Conexión a PostgreSQL verificada"))
    .catch((err) => console.error("❌ No se pudo conectar a PostgreSQL:", err.message));
//# sourceMappingURL=database.js.map