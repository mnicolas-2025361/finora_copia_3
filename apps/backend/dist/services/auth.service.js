import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/database.js";
import { OAuth2Client } from "google-auth-library";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1m";
const JWT_SECRET = process.env.JWT_SECRET ?? "";
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET no está configurado en el archivo .env");
}
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";
if (!GOOGLE_CLIENT_ID) {
    throw new Error("GOOGLE_CLIENT_ID no está configurado en el archivo .env");
}
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
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
export async function loginWithGoogle(idToken) {
    // 1. Verificamos el token directamente con Google (nunca confiamos
    //    en datos que vengan del frontend sin validar)
    const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
        throw new Error("No se pudo verificar la cuenta de Google");
    }
    const { email, name, sub: googleId } = payload;
    // 2. Buscamos si ya existe un usuario con ese correo
    const existing = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    let user;
    if (existing.rows.length > 0) {
        user = existing.rows[0];
        // Si existe pero todavía no tenía google_id vinculado, lo vinculamos
        if (!user.google_id) {
            const updated = await pool.query(`UPDATE users SET google_id = $1 WHERE id = $2
                 RETURNING id, name, email, role`, [googleId, user.id]);
            user = updated.rows[0];
        }
    }
    else {
        // 3. No existe: creamos la cuenta nueva, sin password (login solo por Google)
        const created = await pool.query(`INSERT INTO users (name, email, password, role, google_id)
             VALUES ($1, $2, NULL, 'USER', $3)
             RETURNING id, name, email, role`, [name ?? email, email, googleId]);
        user = created.rows[0];
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