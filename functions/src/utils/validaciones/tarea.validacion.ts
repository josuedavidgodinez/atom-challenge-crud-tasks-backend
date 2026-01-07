/**
 * Validaciones relacionadas con tareas
 */

import {EstadoTarea} from "../../types/tarea.types";

/**
 * Estados válidos para una tarea
 */
export const ESTADOS_VALIDOS: EstadoTarea[] = ["P", "C"];

/**
 * Valida que un ID no esté vacío
 * @param id - ID a validar
 * @param nombreCampo - Nombre del campo para el mensaje de error
 * @returns Objeto con validación y mensaje de error si aplica
 */
export function validarIdRequerido(
  id: string | undefined | null,
  nombreCampo: string
): {
  valido: boolean;
  mensaje?: string;
} {
  if (!id || id.trim() === "") {
    return {
      valido: false,
      mensaje: `El ${nombreCampo} es requerido`,
    };
  }
  return {valido: true};
}

/**
 * Valida que un título no esté vacío
 */
export function validarTituloRequerido(titulo: string | undefined | null): {
  valido: boolean;
  mensaje?: string;
} {
  return validarIdRequerido(titulo, "título");
}

/**
 * Valida que el estado sea válido
 */
export function validarEstado(estado: string): {
  valido: boolean;
  mensaje?: string;
} {
  if (!ESTADOS_VALIDOS.includes(estado as EstadoTarea)) {
    return {
      valido: false,
      mensaje: "El estado debe ser 'P' o 'C'",
    };
  }
  return {valido: true};
}

/**
 * Valida que la tarea pertenezca al usuario
 */
export function validarPropiedadTarea(usuarioPath: string, tareaUsuarioPath: string): {
  valido: boolean;
  mensaje?: string;
} {
  if (tareaUsuarioPath !== usuarioPath) {
    return {
      valido: false,
      mensaje: "No tienes permiso para acceder a esta tarea",
    };
  }
  return {valido: true};
}
