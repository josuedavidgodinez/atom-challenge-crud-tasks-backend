import {onRequest} from "firebase-functions/v2/https";
import {TareaService} from "../services";
import {validarMetodoGet} from "../middlewares/validarMetodoGet";
import {validarAutenticacion, RequestConUsuario} from "../middlewares/validarAutenticacion";
import {validarMetodoPost} from "../middlewares/validarMetodoPost";

const tareaService = new TareaService();

/**
 * Cloud Function: Obtener Tareas por Usuario autenticado
 * Endpoint: obtenerTareasPorUsuario
 * Método: GET (requiere Authorization: Bearer <ID_TOKEN>)
 */
export const obtenerTareasPorUsuario = onRequest(
  {invoker: "public"},
  async (request: RequestConUsuario, response) => {
    if (!validarMetodoGet(request, response)) return;
    if (!await validarAutenticacion(request, response)) return;

    try {
      const uid = request.usuario!.uid;
      const {exito, datos, mensaje} = await tareaService.obtenerTareasPorUsuario(uid);
      const statusCode = exito ? 200 : 400;
      response.status(statusCode).send({exito, datos, mensaje});
    } catch (error) {
      console.error("Error en obtenerTareasPorUsuario:", error);
      response.status(500).send({exito: false, mensaje: "Error al procesar la solicitud"});
    }
  }
);

/**
 * Cloud Function: Crear Tarea
 * Endpoint: crearTarea
 * Método: POST (requiere Authorization: Bearer <ID_TOKEN>)
 */
export const crearTarea = onRequest(
  {invoker: "public"},
  async (request: RequestConUsuario, response) => {
    if (!validarMetodoPost(request, response)) return;
    if (!await validarAutenticacion(request, response)) return;

    try {
      const uid = request.usuario!.uid;
      const payload = request.body || {};

      const {exito, mensaje} = await tareaService.crearTarea(uid, payload);
      const statusCode = exito ? 200 : 400;
      response.status(statusCode).send({exito, mensaje});
    } catch (error) {
      console.error("Error en crearTarea:", error);
      response.status(500).send({exito: false, mensaje: "Error al procesar la solicitud"});
    }
  }
);
