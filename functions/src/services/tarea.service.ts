import {Timestamp} from "@google-cloud/firestore";
import {Tarea, CrearTarea, CrearTareaPayload, ActualizarTareaPayload} from "../types/tarea.types";
import {TareaModel} from "../models";
import {BasedeDatos} from "../types";

export class TareaService {
  private tareaModel: TareaModel;

  constructor(db: BasedeDatos) {
    this.tareaModel = new TareaModel(db);
  }

  /**
   * Valida que la tarea exista y pertenezca al usuario autenticado
   * @private
   */
  private async validarPropiedadTarea(
    usuarioId: string,
    tareaId: string
  ): Promise<{exito: boolean; tarea?: Tarea; mensaje?: string}> {
    // Verificar que la tarea exista
    const tarea = await this.tareaModel.obtenerPorId(tareaId);
    if (!tarea) {
      return {exito: false, mensaje: "Tarea no encontrada"};
    }

    // Verificar que la tarea pertenezca al usuario
    const usuarioPath = `/usuarios/${usuarioId}`;
    if (tarea.usuario !== usuarioPath) {
      return {exito: false, mensaje: "No tienes permiso para acceder a esta tarea"};
    }

    return {exito: true, tarea};
  }

  async obtenerTareasPorUsuario(usuarioId: string): Promise<{exito: boolean; datos?: Tarea[]; mensaje: string}> {
    try {
      if (!usuarioId || usuarioId.trim() === "") {
        return {exito: false, mensaje: "El ID de usuario es requerido"};
      }

      const tareas = await this.tareaModel.obtenerPorUsuario(usuarioId);
      return {exito: true, datos: tareas, mensaje: tareas.length ? "Tareas encontradas" : "Sin tareas"};
    } catch (error) {
      console.error("Error en obtenerTareasPorUsuario:", error);
      return {exito: false, mensaje: "Error interno al obtener tareas"};
    }
  }

  async crearTarea(usuarioId: string, payload: CrearTareaPayload): Promise<{exito: boolean; mensaje: string}> {
    try {
      if (!usuarioId || usuarioId.trim() === "") {
        return {exito: false, mensaje: "El ID de usuario es requerido"};
      }

      // Validaciones básicas
      if (!payload?.titulo || payload.titulo.trim() === "") {
        return {exito: false, mensaje: "El título es requerido"};
      }

      const estadosValidos = ["P", "C"]; // Pendiente, Completada
      if (!estadosValidos.includes(payload.estado)) {
        return {exito: false, mensaje: "El estado debe ser 'P' o 'C'"};
      }
      const estado = payload.estado as "P" | "C";


      const datos: CrearTarea = {
        titulo: payload.titulo.trim(),
        descripcion: (payload.descripcion || "").trim(),
        estado,
        fecha_de_creacion: Timestamp.now(),
        usuario: `/usuarios/${usuarioId}`,
      };

      const ok = await this.tareaModel.crear(datos);
      return ok
        ? {exito: true, mensaje: "Tarea creada exitosamente"}
        : {exito: false, mensaje: "No fue posible crear la tarea"};
    } catch (error) {
      console.error("Error en crearTarea:", error);
      return {exito: false, mensaje: "Error interno al crear la tarea"};
    }
  }

  async actualizarTarea(
    usuarioId: string,
    tareaId: string,
    payload: ActualizarTareaPayload
  ): Promise<{exito: boolean; mensaje: string}> {
    try {
      if (!usuarioId || usuarioId.trim() === "") {
        return {exito: false, mensaje: "El ID de usuario es requerido"};
      }

      if (!tareaId || tareaId.trim() === "") {
        return {exito: false, mensaje: "El ID de tarea es requerido"};
      }

      // Validar existencia y propiedad de la tarea
      const validacion = await this.validarPropiedadTarea(usuarioId, tareaId);
      if (!validacion.exito) {
        return {exito: false, mensaje: validacion.mensaje!};
      }

      // Validar campos si se envían
      const datosActualizar: ActualizarTareaPayload = {};

      if (payload.titulo !== undefined) {
        if (payload.titulo.trim() === "") {
          return {exito: false, mensaje: "El título no puede estar vacío"};
        }
        datosActualizar.titulo = payload.titulo.trim();
      }

      if (payload.descripcion !== undefined) {
        datosActualizar.descripcion = payload.descripcion.trim();
      }

      if (payload.estado !== undefined) {
        const estadosValidos: Array<"P" | "C"> = ["P", "C"];
        if (!estadosValidos.includes(payload.estado)) {
          return {exito: false, mensaje: "El estado debe ser 'P' o 'C'"};
        }
        datosActualizar.estado = payload.estado;
      }

      // Si no hay nada que actualizar
      if (Object.keys(datosActualizar).length === 0) {
        return {exito: false, mensaje: "No se proporcionaron campos para actualizar"};
      }

      const ok = await this.tareaModel.actualizar(tareaId, datosActualizar);
      return ok
        ? {exito: true, mensaje: "Tarea actualizada exitosamente"}
        : {exito: false, mensaje: "No fue posible actualizar la tarea"};
    } catch (error) {
      console.error("Error en actualizarTarea:", error);
      return {exito: false, mensaje: "Error interno al actualizar la tarea"};
    }
  }

  async eliminarTarea(usuarioId: string, tareaId: string): Promise<{exito: boolean; mensaje: string}> {
    try {
      if (!usuarioId || usuarioId.trim() === "") {
        return {exito: false, mensaje: "El ID de usuario es requerido"};
      }

      if (!tareaId || tareaId.trim() === "") {
        return {exito: false, mensaje: "El ID de tarea es requerido"};
      }

      // Validar existencia y propiedad de la tarea
      const validacion = await this.validarPropiedadTarea(usuarioId, tareaId);
      if (!validacion.exito) {
        return {exito: false, mensaje: validacion.mensaje!};
      }

      const ok = await this.tareaModel.eliminar(tareaId);
      return ok
        ? {exito: true, mensaje: "Tarea eliminada exitosamente"}
        : {exito: false, mensaje: "No fue posible eliminar la tarea"};
    } catch (error) {
      console.error("Error en eliminarTarea:", error);
      return {exito: false, mensaje: "Error interno al eliminar la tarea"};
    }
  }
}
