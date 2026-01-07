import {Request, Response} from "express";

/**
 * Middleware para validar que el body de la solicitud sea un JSON válido
 * Solo aplica para métodos que envían body (POST, PUT, PATCH, DELETE)
 */
export function validarJSON(request: Request, response: Response): boolean {
  // Solo validar para métodos que suelen enviar body
  const metodosConBody = ["POST", "PUT", "PATCH", "DELETE"];

  if (!metodosConBody.includes(request.method)) {
    return true;
  }

  // Verificar que el Content-Type sea application/json si hay body
  const contentType = request.get("Content-Type") || "";

  // Si no hay body, es válido
  if (!request.body && Object.keys(request.body || {}).length === 0) {
    return true;
  }

  // Si hay body, verificar que el Content-Type sea correcto
  if (!contentType.includes("application/json")) {
    response.status(415).send({
      exito: false,
      mensaje: "Content-Type debe ser application/json",
    });
    return false;
  }

  // Verificar que el body sea un objeto válido
  try {
    if (typeof request.body !== "object" || request.body === null) {
      response.status(400).send({
        exito: false,
        mensaje: "El body debe ser un objeto JSON válido",
      });
      return false;
    }
  } catch (error) {
    response.status(400).send({
      exito: false,
      mensaje: "Error al procesar el JSON: formato inválido",
    });
    return false;
  }

  return true;
}
