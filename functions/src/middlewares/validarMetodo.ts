import {Request, Response} from "express";

type MetodoHTTP = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/**
 * Crea un middleware genérico para validar el método HTTP
 * Elimina duplicación de código en validadores de método
 * @param metodoPermitido - Método HTTP permitido
 * @returns Función middleware que valida el método
 */
export const crearValidadorMetodo = (metodoPermitido: MetodoHTTP) => {
  return (request: Request, response: Response): boolean => {
    if (request.method !== metodoPermitido) {
      response.status(405).send({
        exito: false,
        mensaje: `Solo se permiten solicitudes ${metodoPermitido}`,
      });
      return false;
    }

    return true;
  };
};

// Exportar middlewares pre-configurados para compatibilidad
export const validarMetodoGet = crearValidadorMetodo("GET");
export const validarMetodoPost = crearValidadorMetodo("POST");
export const validarMetodoPut = crearValidadorMetodo("PUT");
export const validarMetodoDelete = crearValidadorMetodo("DELETE");
export const validarMetodoPatch = crearValidadorMetodo("PATCH");
