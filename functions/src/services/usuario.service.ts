import {DatabaseFirestore} from "../database/basededatos.firestore";
import {UsuarioModel} from "../models";
import {Usuario, CrearUsuario} from "../types/usuario.types";

/**
 * Servicio de Usuario - Lógica de negocio para operaciones de usuario
 */
export class UsuarioService {
  private usuarioModel: UsuarioModel;

  constructor() {
    const db = DatabaseFirestore.obtenerInstancia();
    this.usuarioModel = new UsuarioModel(db);
  }

  /**
   * Crea un nuevo usuario
   * @param datosUsuario - Datos del usuario a crear
   * @returns Promise<{exito: boolean, mensaje: string}>
   */
  async crearUsuario(datosUsuario: CrearUsuario): Promise<{exito: boolean; mensaje: string}> {
    try {
      // Validar que el correo no esté vacío
      if (!datosUsuario.correo || datosUsuario.correo.trim() === "") {
        return {
          exito: false,
          mensaje: "El correo electrónico es requerido",
        };
      }

      // Validar formato de correo (básico)
      const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regexCorreo.test(datosUsuario.correo)) {
        return {
          exito: false,
          mensaje: "El formato del correo electrónico no es válido",
        };
      }

      // Verificar que el correo no exista
      const usuarioExistente = await this.usuarioModel.obtenerPorQuery({
        correo: datosUsuario.correo,
      });

      if (usuarioExistente) {
        return {
          exito: false,
          mensaje: "El correo electrónico ya está registrado",
        };
      }

      // Crear el usuario
      const resultado = await this.usuarioModel.crear(datosUsuario);

      if (resultado) {
        return {
          exito: true,
          mensaje: "Usuario creado exitosamente",
        };
      }

      return {
        exito: false,
        mensaje: "Error al crear el usuario",
      };
    } catch (error) {
      console.error("Error en crearUsuario:", error);
      return {
        exito: false,
        mensaje: "Error interno al crear el usuario",
      };
    }
  }

  /**
   * Busca un usuario por correo electrónico
   * @param correo - Correo del usuario a buscar
   * @returns Promise<{exito: boolean, datos?: Usuario, mensaje: string}>
   */
  async obtenerUsuarioPorCorreo(correo: string): Promise<{exito: boolean; datos?: Usuario; mensaje: string}> {
    try {
      // Validar que el correo no esté vacío
      if (!correo || correo.trim() === "") {
        return {
          exito: false,
          mensaje: "El correo electrónico es requerido",
        };
      }

      // Buscar el usuario
      const usuario = await this.usuarioModel.obtenerPorQuery({correo});

      if (usuario) {
        return {
          exito: true,
          datos: usuario,
          mensaje: "Usuario encontrado",
        };
      }

      return {
        exito: false,
        mensaje: "Usuario no encontrado",
      };
    } catch (error) {
      console.error("Error en obtenerUsuarioPorCorreo:", error);
      return {
        exito: false,
        mensaje: "Error interno al buscar el usuario",
      };
    }
  }
}
