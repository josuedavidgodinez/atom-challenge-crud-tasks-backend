// Middleware genérico de validación de métodos HTTP
export {
  crearValidadorMetodo,
  validarMetodoGet,
  validarMetodoPost,
  validarMetodoPut,
  validarMetodoDelete,
  validarMetodoPatch,
} from "./validarMetodo";

// Middleware de validación de JSON
export {validarJSON} from "./validarJSON";

// Middleware de autenticación
export {crearMiddlewareAutenticacion} from "./validarAutenticacion";
export type {RequestConUsuario} from "./validarAutenticacion";
