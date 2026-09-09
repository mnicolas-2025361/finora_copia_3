export const obtenerResumenHome = (req, res) => {
    // Aquí puedes hacer la consulta real a tu base de datos para sumar gastos e ingresos del mes
    const resumenFinanciero = {
        presupuesto: 8500.00,
        gastado: 3259.50,
        saldoDisponible: 5240.50
    };
    res.json(resumenFinanciero);
};
//# sourceMappingURL=home.controller.js.map