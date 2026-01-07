import {onRequest} from "firebase-functions/v2/https";
import {UsuarioService} from "../services";
import {CrearUsuario} from "../types/usuario.types";
import {validarMetodoPost} from "../middlewares/validarMetodoPost";
import {validarJSON} from "../middlewares/validarJSON";
import {DatabaseFirestore} from "../database/basededatos.firestore";
import {AutenticacionFirebase} from "../adapters";
import cors from "cors";

const corsHandler = cors({origin: true});
const db = DatabaseFirestore.obtenerInstancia();
const autenticacion = new AutenticacionFirebase();
const usuarioService = new UsuarioService(db, autenticacion);

/**
 * Cloud Function: Crear Usuario
 * Endpoint: crearUsuario
 * Método: POST
 * Body esperado: {correo: string, nombre?: string}
 */
export const crearUsuario = onRequest(
    {invoker: "public"},
    async (request, response) => {
  return corsHandler(request, response, async () => {
    if (!validarMetodoPost(request, response)) return;
    if (!validarJSON(request, response)) return;

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
});

/**
 * Cloud Function: Login de Usuario
 * Endpoint: loginUsuario
 * Método: POST
 * Body esperado: {correo: string}
 * Retorna: {exito: boolean, token?: string, usuario?: Usuario, mensaje: string}
 */
export const loginUsuario = onRequest(
    {invoker: "public"},
    async (request, response) => {
  return corsHandler(request, response, async () => {
    if (!validarMetodoPost(request, response)) return;
    if (!validarJSON(request, response)) return;

  try {
    const correo: string = request?.body?.correo;

    // Llamar al servicio para autenticar el usuario
    const {exito, token, usuario, mensaje} = await usuarioService.loginUsuario(correo);

    const statusCode = exito ? 200 : 401;
    response.status(statusCode).send({exito, token, usuario, mensaje});
  } catch (error) {
    console.error("Error en loginUsuario cloud function:", error);
    response.status(500).send({
      exito: false,
      mensaje: "Error al procesar login",
    });
  }
  });
});
