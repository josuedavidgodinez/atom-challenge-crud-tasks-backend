import {Timestamp} from "@google-cloud/firestore";
import {DatabaseFirestore} from "../database/basededatos.firestore";
import {Tarea, CrearTarea, CrearTareaPayload} from "../types/tarea.types";
import {TareaModel} from "../models";

export class TareaService {
  private tareaModel: TareaModel;

  constructor() {
    const db = DatabaseFirestore.obtenerInstancia();
    this.tareaModel = new TareaModel(db);
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
}
