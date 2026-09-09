import express, { type Express } from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import homeRoutes from "./routes/home.routes.js";
import ingresoRoutes from "./routes/ingreso.routes.js";
import gastoRoutes from "./routes/gasto.routes.js"; // NUEVO

const app: Express = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/ingresos", ingresoRoutes);
app.use("/api/gastos", gastoRoutes); // NUEVO

export default app;