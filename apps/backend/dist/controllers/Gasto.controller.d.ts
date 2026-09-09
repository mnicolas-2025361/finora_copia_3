import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
export declare const obtenerGastos: (req: AuthRequest, res: Response) => Promise<void>;
export declare const crearGasto: (req: AuthRequest, res: Response) => Promise<void>;
export declare const eliminarGasto: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=Gasto.controller.d.ts.map