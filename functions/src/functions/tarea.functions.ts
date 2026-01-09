import {onRequest} from "firebase-functions/v2/https";
import {TareaService} from "../services";
import {validarMetodoGet, validarMetodoPost, validarMetodoPut, validarMetodoDelete,
  crearMiddlewareAutenticacion, RequestConUsuario, validarJSON
} from "../middlewares";
import {DatabaseFirestore} from "../database/basededatos.firestore";
import {TiempoFirestore, VerificadorTokenFirebase} from "../adapters";
import {corsHandler, corsOrigin} from "../config/cors.config";

const db = DatabaseFirestore.obtenerInstancia();
const tiempo = new TiempoFirestore();
const verificadorToken = new VerificadorTokenFirebase();
const validarAutenticacion = crearMiddlewareAutenticacion(verificadorToken);
const tareaService = new TareaService(db, tiempo);

/**
 * Cloud Function: Obtener Tareas por Usuario autenticado
 * Endpoint: obtenerTareasPorUsuario
 * Método: GET (requiere Authorization: Bearer <ID_TOKEN>)
 */
export const obtenerTareasPorUsuario = onRequest(
  {invoker: "public", cors: corsOrigin},
  async (request: RequestConUsuario, response) => {
    return corsHandler(request, response, async () => {
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
    });
  }
);

/**
 * Cloud Function: Crear Tarea
 * Endpoint: crearTarea
 * Método: POST (requiere Authorization: Bearer <ID_TOKEN>)
 */
export const crearTarea = onRequest(
  {invoker: "public", cors: corsOrigin},
  async (request: RequestConUsuario, response) => {
    return corsHandler(request, response, async () => {
      if (!validarMetodoPost(request, response)) return;
      if (!validarJSON(request, response)) return;
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
    });
  }
);

/**
 * Cloud Function: Actualizar Tarea
 * Endpoint: actualizarTarea
 * Método: PUT (requiere Authorization: Bearer <ID_TOKEN>)
 * Body: { tareaId: string, titulo?: string, descripcion?: string, estado?: "P" | "C" }
 */
export const actualizarTarea = onRequest(
  {invoker: "public", cors: corsOrigin},
  async (request: RequestConUsuario, response) => {
    return corsHandler(request, response, async () => {
      if (!validarMetodoPut(request, response)) return;
      if (!validarJSON(request, response)) return;
      if (!await validarAutenticacion(request, response)) return;

      try {
        const uid = request.usuario!.uid;
        const {tareaId, ...payload} = request.body || {};

        if (!tareaId) {
          response.status(400).send({exito: false, mensaje: "El ID de tarea es requerido"});
          return;
        }

        const {exito, mensaje} = await tareaService.actualizarTarea(uid, tareaId, payload);
        const statusCode = exito ? 200 : 400;
        response.status(statusCode).send({exito, mensaje});
      } catch (error) {
        console.error("Error en actualizarTarea:", error);
        response.status(500).send({exito: false, mensaje: "Error al procesar la solicitud"});
      }
    });
  }
);

/**
 * Cloud Function: Eliminar Tarea
 * Endpoint: eliminarTarea
 * Método: DELETE (requiere Authorization: Bearer <ID_TOKEN>)
 * Body: { tareaId: string }
 */
export const eliminarTarea = onRequest(
  {invoker: "public", cors: corsOrigin},
  async (request: RequestConUsuario, response) => {
    return corsHandler(request, response, async () => {
      if (!validarMetodoDelete(request, response)) return;
      if (!validarJSON(request, response)) return;
      if (!await validarAutenticacion(request, response)) return;

      try {
        const uid = request.usuario!.uid;
        const {tareaId} = request.body || {};

        if (!tareaId) {
          response.status(400).send({exito: false, mensaje: "El ID de tarea es requerido"});
          return;
        }

        const {exito, mensaje} = await tareaService.eliminarTarea(uid, tareaId);
        const statusCode = exito ? 200 : 400;
        response.status(statusCode).send({exito, mensaje});
      } catch (error) {
        console.error("Error en eliminarTarea:", error);
        response.status(500).send({exito: false, mensaje: "Error al procesar la solicitud"});
      }
    });
  }
);
