import {onRequest} from "firebase-functions/v2/https";
import {UsuarioService} from "../services";
import {CrearUsuario} from "../types/usuario.types";
import {validarMetodoPost} from "../middlewares/validarMetodoPost";

const usuarioService = new UsuarioService();

/**
 * Cloud Function: Crear Usuario
 * Endpoint: crearUsuario
 * Método: POST
 * Body esperado: {correo: string, nombre?: string}
 */
export const crearUsuario = onRequest(
    {invoker: "public"},
    async (request, response) => {
  if (!validarMetodoPost(request, response)) return;

  try {
    // Validar que hay datos en el request
    if (!request.body || !request.body.correo) {
      response.status(400).send({
        exito: false,
        mensaje: "No se proporcionaron datos o falta el correo",
      });
      return;
    }

    const datosUsuario: CrearUsuario = {
      correo: request.body.correo,
    };

    // Llamar al servicio para crear el usuario
    const {exito, mensaje} = await usuarioService.crearUsuario(datosUsuario);
    const statusCode = exito ? 200 : 400;
    response.status(statusCode).send({exito, mensaje});
  } catch (error) {
    console.error("Error en crearUsuario cloud function:", error);
    response.status(500).send({
      exito: false,
      mensaje: "Error al procesar la solicitud",
    });
  }
});

/**
 * Cloud Function: Obtener Usuario por Correo
 * Endpoint: obtenerUsuarioPorCorreo
 * Método: POST
 * Body esperado: {correo: string}
 */
export const obtenerUsuarioPorCorreo = onRequest(
    {invoker: "public"},
    async (request, response) => {
  if (!validarMetodoPost(request, response)) return;

  try {
    // Validar que hay datos en el request
    if (!request.body || !request.body.correo) {
      response.status(400).send({
        exito: false,
        mensaje: "El correo electrónico es requerido",
      });
      return;
    }

    const correo: string = request.body.correo;

    // Llamar al servicio para obtener el usuario
    const {exito, datos, mensaje} = await usuarioService.obtenerUsuarioPorCorreo(correo);

    const statusCode = exito ? 200 : 400;
    response.status(statusCode).send({exito, datos, mensaje});
  } catch (error) {
    console.error("Error en obtenerUsuarioPorCorreo cloud function:", error);
    response.status(500).send({
      exito: false,
      mensaje: "Error al procesar la solicitud",
    });
  }
});
