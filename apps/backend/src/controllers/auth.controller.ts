import type { Request, Response } from "express";
import {
  loginUser,
  registerUser,
  loginWithGoogle,
} from "../services/auth.service.js";

export async function register(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        message: "Nombre, correo y contraseña son obligatorios",
      });
      return;
    }

    const user = await registerUser({
      name,
      email,
      password,
    });

    res.status(201).json({
      message: "Usuario registrado correctamente",
      user,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al registrar el usuario";

    res.status(400).json({
      message,
    });
  }
}

export async function googleLogin(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      res.status(400).json({
        message: "Falta el token de Google",
      });
      return;
    }

    const result = await loginWithGoogle(idToken);

    res.status(200).json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al iniciar sesión con Google";

    res.status(401).json({
      message,
    });
  }
}

export async function login(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        message: "Correo y contraseña son obligatorios",
      });
      return;
    }

    const result = await loginUser({
      email,
      password,
    });

    res.status(200).json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al iniciar sesión";

    res.status(401).json({
      message,
    });
  }
}