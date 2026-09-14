import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
import { pool } from '../config/database.js';

// 1. Obtener solo los gastos del usuario logueado
export const obtenerGastos = async (req: AuthRequest, res: Response) => {
    try {
    const usuarioId = req.user!.userId;

    const { rows } = await pool.query(
        'SELECT id, usuario_id, descripcion, monto, fecha, categoria FROM gastos WHERE usuario_id = $1 ORDER BY fecha DESC, id DESC',
        [usuarioId]
    );

    res.json(rows);
    } catch (error) {
    console.error('Error al obtener gastos:', error);
    res.status(500).json({ mensaje: 'Error al obtener los gastos' });
    }
};

// 2. Registrar un nuevo gasto, tomando el usuario del token (no del frontend)
export const crearGasto = async (req: AuthRequest, res: Response) => {
    try {
    const usuarioId = req.user!.userId;
    const { descripcion, monto, fecha, categoria } = req.body;

    if (!descripcion || monto === undefined || monto === null) {
        res.status(400).json({ mensaje: 'La descripcion y el monto son obligatorios' });
        return;
    }

    const montoNumerico = Number(monto);
    if (Number.isNaN(montoNumerico) || montoNumerico <= 0) {
        res.status(400).json({ mensaje: 'El monto debe ser un numero mayor a cero' });
        return;
    }

    const fechaGasto = fecha || new Date().toISOString().split('T')[0];
    const catGasto = categoria || 'General';

    const query = `
        INSERT INTO gastos (usuario_id, descripcion, monto, fecha, categoria)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, usuario_id, descripcion, monto, fecha, categoria
    `;

    const result = await pool.query(query, [
        usuarioId,
        descripcion,
        montoNumerico,
        fechaGasto,
        catGasto
    ]);

    res.status(201).json(result.rows[0]);
    } catch (error) {
    console.error('Error al guardar el gasto en PostgreSQL:', error);
    res.status(500).json({ mensaje: 'Error al registrar el gasto' });
    }
};

// 3. Eliminar un gasto, validando que pertenezca al usuario del token
export const eliminarGasto = async (req: AuthRequest, res: Response) => {
    try {
    const usuarioId = req.user!.userId;
    const { id } = req.params;

    const result = await pool.query(
        'DELETE FROM gastos WHERE id = $1 AND usuario_id = $2',
        [id, usuarioId]
    );

    if (result.rowCount === 0) {
        res.status(404).json({ mensaje: 'Gasto no encontrado' });
        return;
    }

    res.json({ mensaje: 'Gasto eliminado exitosamente' });
    } catch (error) {
    console.error('Error al eliminar el gasto de PostgreSQL:', error);
    res.status(500).json({ mensaje: 'Error al eliminar el gasto' });
    }
};