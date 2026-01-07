import * as admin from "firebase-admin";
import {UsuarioModel} from "../models";
import {Usuario, CrearUsuario} from "../types/usuario.types";
import {BasedeDatos} from "../types";

/**
 * Servicio de Usuario - Lógica de negocio para operaciones de usuario
 */
export class UsuarioService {
  private usuarioModel: UsuarioModel;

  constructor(db:BasedeDatos) {
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
   * Autentica un usuario y genera un custom token
   * @param correo - Correo del usuario a autenticar
   * @returns Promise<{exito: boolean, token?: string, usuario?: Usuario, mensaje: string}>
   */
  async loginUsuario(correo: string): Promise<{exito: boolean; token?: string; usuario?: Usuario; mensaje: string}> {
    try {
      // Validar que el correo no esté vacío
      if (!correo || correo.trim() === "") {
        return {
          exito: false,
          mensaje: "El correo electrónico es requerido",
        };
      }

      // Verificar que el usuario existe en Firestore
      const usuario = await this.usuarioModel.obtenerPorQuery({correo});

      if (!usuario) {
        return {
          exito: false,
          mensaje: "Usuario no encontrado",
        };
      }

      // Generar custom token con Firebase Admin
      const customToken = await admin.auth().createCustomToken(usuario.id, {
        email: usuario.correo,
      });

      return {
        exito: true,
        token: customToken,
        usuario: usuario,
        mensaje: "Login exitoso",
      };
    } catch (error) {
      console.error("Error en loginUsuario:", error);
      return {
        exito: false,
        mensaje: "Error interno al procesar login",
      };
    }
  }
}
