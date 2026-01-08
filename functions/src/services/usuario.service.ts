import {UsuarioModel} from "../models";
import {Usuario, CrearUsuario} from "../types/usuario.types";
import {BasedeDatos, IAutenticacion} from "../types";
import {validarEmail} from "../utils";

/**
 * Servicio de Usuario - Lógica de negocio para operaciones de usuario
 */
export class UsuarioService {
  private usuarioModel: UsuarioModel;
  private autenticacion: IAutenticacion;

  constructor(db: BasedeDatos, autenticacion: IAutenticacion) {
    this.usuarioModel = new UsuarioModel(db);
    this.autenticacion = autenticacion;
  }

  /**
   * Crea un nuevo usuario
   * @param datosUsuario - Datos del usuario a crear
   * @returns Promise<{exito: boolean, mensaje: string}>
   */
  async crearUsuario(datosUsuario: CrearUsuario): Promise<{exito: boolean; mensaje: string}> {
    try {
      // Validar correo usando utils
      const validacionEmail = validarEmail(datosUsuario.correo);
      if (!validacionEmail.valido) {
        return {
          exito: false,
          mensaje: validacionEmail.mensaje!,
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

      // Primero crear el usuario en Firebase Auth
      const uid = await this.autenticacion.crearUsuario(datosUsuario.correo);

      // Luego guardar en Firestore con el mismo UID
      const resultado = await this.usuarioModel.crear(uid, datosUsuario);

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
      // Validar correo usando utils
      const validacionEmail = validarEmail(correo);
      if (!validacionEmail.valido) {
        return {
          exito: false,
          mensaje: validacionEmail.mensaje!,
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

      // Generar custom token usando el servicio de autenticación inyectado
      const customToken = await this.autenticacion.crearTokenPersonalizado(usuario.id, {
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
