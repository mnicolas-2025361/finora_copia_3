import { Router } from "express";
import { login, register, googleLogin } from "../controllers/auth.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
const router = Router();
router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.get("/me", authenticateToken, (req, res) => {
    res.status(200).json({
        message: "Sesión válida",
        user: req.user
    });
});
export default router;
//# sourceMappingURL=auth.routes.js.map