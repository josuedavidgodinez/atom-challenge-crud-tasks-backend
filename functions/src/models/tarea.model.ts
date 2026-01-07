import {BasedeDatos} from "../types";
import {Tarea, CrearTarea} from "../types/tarea.types";

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

  async crear(datos: CrearTarea): Promise<boolean> {
    return this.db.guardarDatos(this.coleccion, datos);
  }
}
