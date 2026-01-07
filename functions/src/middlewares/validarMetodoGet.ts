import {Request, Response} from "express";

// Middleware simple para asegurar que la solicitud sea GET
export function validarMetodoGet(request: Request, response: Response): boolean {
  if (request.method !== "GET") {
    response.status(405).send({
      exito: false,
      mensaje: "Solo se permiten solicitudes GET",
    });
    return false;
  }

  return true;
}
