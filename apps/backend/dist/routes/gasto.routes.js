import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { obtenerGastos, crearGasto, eliminarGasto } from '../controllers/Gasto.controller.js';
const router = Router();
router.get('/', authenticateToken, obtenerGastos);
router.post('/', authenticateToken, crearGasto);
router.delete('/:id', authenticateToken, eliminarGasto);
export default router;
//# sourceMappingURL=gasto.routes.js.map