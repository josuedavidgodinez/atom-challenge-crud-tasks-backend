import {Request, Response} from "express";

// Middleware simple para asegurar que la solicitud sea PUT
export function validarMetodoPut(request: Request, response: Response): boolean {
  if (request.method !== "PUT") {
    response.status(405).send({
      exito: false,
      mensaje: "Solo se permiten solicitudes PUT",
    });
    return false;
  }

  return true;
}
