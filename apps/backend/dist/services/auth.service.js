import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/database.js";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1m";
const JWT_SECRET = process.env.JWT_SECRET ?? "";
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET no está configurado en el archivo .env");
}
export async function registerUser(data) {
    const { name, email, password } = data;
    const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
        throw new Error("El correo ya está registrado");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(`INSERT INTO users (name, email, password, role)
        VALUES ($1, $2, $3, 'USER')
        RETURNING id, name, email, role, created_at`, [name, email, hashedPassword]);
    return result.rows[0];
}
export async function loginUser(data) {
    const { email, password } = data;
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
        throw new Error("Correo o contraseña incorrectos");
    }
    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        throw new Error("Correo o contraseña incorrectos");
    }
    const role = user.role;
    const token = jwt.sign({
        userId: user.id,
        role
    }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    });
    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role
        }
    };
}
//# sourceMappingURL=auth.service.js.map