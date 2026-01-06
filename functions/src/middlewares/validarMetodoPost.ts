import {Request, Response} from "express";

// Middleware simple para asegurar que la solicitud sea POST
export function validarMetodoPost(request: Request, response: Response): boolean {
  if (request.method !== "POST") {
    response.status(405).send({
      exito: false,
      mensaje: "Solo se permiten solicitudes POST",
    });
    return false;
  }

  return true;
}
