import {Tarea, CrearTarea, CrearTareaPayload, ActualizarTareaPayload, EstadoTarea} from "../types/tarea.types";
import {TareaModel} from "../models";
import {BasedeDatos, ITiempo} from "../types";
import {
  validarIdRequerido,
  validarTituloRequerido,
  validarEstado,
  validarPropiedadTarea,
  construirPathUsuario,
  normalizarTexto,
} from "../utils";

export class TareaService {
  private tareaModel: TareaModel;
  private tiempo: ITiempo;

  constructor(db: BasedeDatos, tiempo: ITiempo) {
    this.tareaModel = new TareaModel(db);
    this.tiempo = tiempo;
  }

  /**
   * Valida que la tarea exista y pertenezca al usuario autenticado
   * @private
   */
  private async validarPropiedadTareaInterno(
    usuarioId: string,
    tareaId: string
  ): Promise<{exito: boolean; tarea?: Tarea; mensaje?: string}> {
    // Verificar que la tarea exista
    const tarea = await this.tareaModel.obtenerPorId(tareaId);
    if (!tarea) {
      return {exito: false, mensaje: "Tarea no encontrada"};
    }

    // Verificar que la tarea pertenezca al usuario usando utils
    const usuarioPath = construirPathUsuario(usuarioId);
    const validacion = validarPropiedadTarea(usuarioPath, tarea.usuario);
    if (!validacion.valido) {
      return {exito: false, mensaje: validacion.mensaje};
    }

    return {exito: true, tarea};
  }

  async obtenerTareasPorUsuario(usuarioId: string): Promise<{exito: boolean; datos?: Tarea[]; mensaje: string}> {
    try {
      const validacion = validarIdRequerido(usuarioId, "ID de usuario");
      if (!validacion.valido) {
        return {exito: false, mensaje: validacion.mensaje!};
      }

      const tareas = await this.tareaModel.obtenerPorUsuario(usuarioId);
      return {exito: true, datos: tareas, mensaje: tareas.length ? "Se han encontrado tareas" : "Sin tareas"};
    } catch (error) {
      console.error("Error en obtenerTareasPorUsuario:", error);
      return {exito: false, mensaje: "Error interno al obtener tareas"};
    }
  }

  async crearTarea(usuarioId: string, payload: CrearTareaPayload): Promise<{exito: boolean; mensaje: string}> {
    try {
      // Validar usuario usando utils
      const validacionUsuario = validarIdRequerido(usuarioId, "ID de usuario");
      if (!validacionUsuario.valido) {
        return {exito: false, mensaje: validacionUsuario.mensaje!};
      }

      // Validar título usando utils
      const validacionTitulo = validarTituloRequerido(payload?.titulo);
      if (!validacionTitulo.valido) {
        return {exito: false, mensaje: validacionTitulo.mensaje!};
      }

      // Validar estado usando utils
      const validacionEstado = validarEstado(payload.estado);
      if (!validacionEstado.valido) {
        return {exito: false, mensaje: validacionEstado.mensaje!};
      }

      const datos: CrearTarea = {
        titulo: normalizarTexto(payload.titulo),
        descripcion: normalizarTexto(payload.descripcion),
        estado: payload.estado as EstadoTarea,
        fecha_de_creacion: this.tiempo.ahora(),
        usuario: construirPathUsuario(usuarioId),
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
      // Validar IDs usando utils
      const validacionUsuario = validarIdRequerido(usuarioId, "ID de usuario");
      if (!validacionUsuario.valido) {
        return {exito: false, mensaje: validacionUsuario.mensaje!};
      }

      const validacionTarea = validarIdRequerido(tareaId, "ID de tarea");
      if (!validacionTarea.valido) {
        return {exito: false, mensaje: validacionTarea.mensaje!};
      }

      // Validar existencia y propiedad de la tarea
      const validacion = await this.validarPropiedadTareaInterno(usuarioId, tareaId);
      if (!validacion.exito) {
        return {exito: false, mensaje: validacion.mensaje!};
      }

      // Validar campos si se envían usando utils
      const datosActualizar: ActualizarTareaPayload = {};

      if (payload.titulo !== undefined) {
        const validacionTitulo = validarTituloRequerido(payload.titulo);
        if (!validacionTitulo.valido) {
          return {exito: false, mensaje: validacionTitulo.mensaje!};
        }
        datosActualizar.titulo = normalizarTexto(payload.titulo);
      }

      if (payload.descripcion !== undefined) {
        datosActualizar.descripcion = normalizarTexto(payload.descripcion);
      }

      if (payload.estado !== undefined) {
        const validacionEstado = validarEstado(payload.estado);
        if (!validacionEstado.valido) {
          return {exito: false, mensaje: validacionEstado.mensaje!};
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
      // Validar IDs usando utils
      const validacionUsuario = validarIdRequerido(usuarioId, "ID de usuario");
      if (!validacionUsuario.valido) {
        return {exito: false, mensaje: validacionUsuario.mensaje!};
      }

      const validacionTarea = validarIdRequerido(tareaId, "ID de tarea");
      if (!validacionTarea.valido) {
        return {exito: false, mensaje: validacionTarea.mensaje!};
      }

      // Validar existencia y propiedad de la tarea
      const validacion = await this.validarPropiedadTareaInterno(usuarioId, tareaId);
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
