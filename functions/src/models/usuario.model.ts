import {BasedeDatos} from "../types";
import {Usuario, CrearUsuario} from "../types/usuario.types";

/**
 * Modelo de Usuario que interactúa con Firestore
 */
export class UsuarioModel {
  private readonly coleccion = "usuarios";

  constructor(private db: BasedeDatos) {}

  /**
   * Crea un nuevo usuario en Firestore con un UID específico
   * @param uid - UID del usuario (generalmente del sistema de autenticación)
   * @param datosUsuario - Datos del usuario a crear
   * @returns Promise<boolean> - true si se guardó correctamente
   */
  async crear(uid: string, datosUsuario: CrearUsuario): Promise<boolean> {
    try {
      return await this.db.guardarDatosConId(this.coleccion, uid, datosUsuario);
    } catch (error) {
      console.error("Error al crear usuario:", error);
      throw error;
    }
  }

  /**
   * Obtiene un usuario por query
   * @param query - Query para buscar el usuario
   * @returns Promise<Usuario | null> - Usuario encontrado o null
   */
  async obtenerPorQuery<Q>(query: Q): Promise<Usuario | null> {
    try {
      const resultado = await this.db.obtenerDatos<Usuario, Q>(
        this.coleccion,
        query
      );

      if (Array.isArray(resultado)) {
        return resultado[0] || null;
      }

      return resultado;
    } catch (error) {
      console.error("Error al obtener usuario por correo:", error);
      throw error;
    }
  }
}
