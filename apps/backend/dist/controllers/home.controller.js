import { pool } from '../config/database.js';
export const obtenerResumenHome = async (req, res) => {
    try {
        const usuarioId = req.user.userId;
        const ahora = new Date();
        // Gastos de este mes (para la tarjeta "GASTOS DE ESTE MES")
        const gastosMesResult = await pool.query(`SELECT COALESCE(SUM(monto), 0) AS total FROM gastos
       WHERE usuario_id = $1
         AND EXTRACT(MONTH FROM fecha) = $2
         AND EXTRACT(YEAR FROM fecha) = $3`, [usuarioId, ahora.getMonth() + 1, ahora.getFullYear()]);
        const gastadoMes = Number(gastosMesResult.rows[0].total);
        // Saldo disponible = todos los ingresos historicos - todos los gastos historicos
        const ingresosResult = await pool.query('SELECT COALESCE(SUM(monto), 0) AS total FROM ingresos WHERE usuario_id = $1', [usuarioId]);
        const totalIngresos = Number(ingresosResult.rows[0].total);
        const gastosResult = await pool.query('SELECT COALESCE(SUM(monto), 0) AS total FROM gastos WHERE usuario_id = $1', [usuarioId]);
        const totalGastos = Number(gastosResult.rows[0].total);
        const saldoDisponible = totalIngresos - totalGastos;
        const resumenFinanciero = {
            presupuesto: 8500.00,
            gastado: gastadoMes,
            saldoDisponible
        };
        res.json(resumenFinanciero);
    }
    catch (error) {
        console.error('Error al calcular el resumen del home:', error);
        res.status(500).json({ mensaje: 'Error al calcular el resumen financiero' });
    }
};
//# sourceMappingURL=home.controller.js.map