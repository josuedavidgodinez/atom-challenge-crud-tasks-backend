import {Request, Response} from "express";

// Middleware simple para asegurar que la solicitud sea DELETE
export function validarMetodoDelete(request: Request, response: Response): boolean {
  if (request.method !== "DELETE") {
    response.status(405).send({
      exito: false,
      mensaje: "Solo se permiten solicitudes DELETE",
    });
    return false;
  }

  return true;
}
