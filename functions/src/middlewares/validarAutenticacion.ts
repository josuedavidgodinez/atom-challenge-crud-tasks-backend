import {Request, Response} from "express";
import {IVerificadorToken, UsuarioDecodificado} from "../types";

/**
 * Interfaz extendida de Request que incluye información del usuario autenticado
 */
export interface RequestConUsuario extends Request {
  usuario?: UsuarioDecodificado;
}

/**
 * Crea un middleware de autenticación con el verificador de token inyectado
 * @param verificador - Implementación de IVerificadorToken
 * @returns Función middleware
 */
export const crearMiddlewareAutenticacion = (verificador: IVerificadorToken) => {
  return async (
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

      // Verificar el token usando el verificador inyectado
      const usuario = await verificador.verificarToken(idToken);

      // Adjuntar información del usuario al request
      request.usuario = usuario;

      return true;
    } catch (error) {
      console.error("Error validando token:", error);
      response.status(401).send({
        exito: false,
        mensaje: error instanceof Error ? error.message : "Token inválido o expirado",
      });
      return false;
    }
  };
};
