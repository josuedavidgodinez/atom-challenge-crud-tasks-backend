import * as admin from "firebase-admin";
import {Request, Response} from "express";

/**
 * Interfaz extendida de Request que incluye información del usuario autenticado
 */
export interface RequestConUsuario extends Request {
  usuario?: {
    uid: string;
    email?: string;
  };
}

/**
 * Middleware para validar el token de autenticación de Firebase
 * @param request - Request con posible información de usuario
 * @param response - Response de Express
 * @returns Promise<boolean> - true si el token es válido, false en caso contrario
 */
export const validarAutenticacion = async (
  request: RequestConUsuario,
  response: Response
): Promise<boolean> => {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      response.status(401).send({
        exito: false,
        mensaje: "Token de autenticación no proporcionado",
      });
      return false;
    }

    const idToken = authHeader.split("Bearer ")[1];

    // Verificar el token con Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Adjuntar información del usuario al request
    request.usuario = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };

    return true;
  } catch (error) {
    console.error("Error validando token:", error);
    response.status(401).send({
      exito: false,
      mensaje: "Token inválido o expirado",
    });
    return false;
  }
};
