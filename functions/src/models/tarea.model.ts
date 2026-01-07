import {BasedeDatos} from "../types";
import {Tarea, CrearTarea, ActualizarTareaPayload} from "../types/tarea.types";

export class TareaModel {
  private readonly coleccion = "tareas";

  constructor(private db: BasedeDatos) {}

  async obtenerPorUsuario(usuarioId: string): Promise<Tarea[]> {
    const usuarioPath = `/usuarios/${usuarioId}`;
    const resultado = await this.db.obtenerDatos<Tarea, {usuario: string}>(
      this.coleccion,
      {usuario: usuarioPath}
    );

    if (!resultado) return [];
    if (Array.isArray(resultado)) return resultado;
    return [resultado];
  }

  async obtenerPorId(tareaId: string): Promise<Tarea | null> {
    const resultado = await this.db.obtenerDatos<Tarea, {}>(
      this.coleccion,
      {}
    );

    if (!resultado) return null;

    // Si es un arreglo, buscar por ID
    if (Array.isArray(resultado)) {
      const tarea = resultado.find((t) => t.id === tareaId);
      return tarea || null;
    }

    // Si es un solo documento, verificar si coincide el ID
    return resultado.id === tareaId ? resultado : null;
  }

  async crear(datos: CrearTarea): Promise<boolean> {
    return this.db.guardarDatos(this.coleccion, datos);
  }

  async actualizar(tareaId: string, datos: ActualizarTareaPayload): Promise<boolean> {
    try {
      await this.db.actualizarDatos(this.coleccion, datos, tareaId);
      return true;
    } catch (error) {
      console.error("Error al actualizar tarea:", error);
      return false;
    }
  }

  async eliminar(tareaId: string): Promise<boolean> {
    return this.db.eliminarDatos(this.coleccion, tareaId);
  }
}
