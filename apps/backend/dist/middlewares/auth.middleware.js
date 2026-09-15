import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET ?? "";
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET no está configurado en el archivo .env");
}
export function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({
            message: "No se proporcionó un token"
        });
        return;
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        res.status(401).json({
            message: "Token inválido"
        });
        return;
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({
                message: "Sesión expirada",
                code: "TOKEN_EXPIRED"
            });
            return;
        }
        res.status(401).json({
            message: "Token inválido",
            code: "TOKEN_INVALID"
        });
    }
}
//# sourceMappingURL=auth.middleware.js.map