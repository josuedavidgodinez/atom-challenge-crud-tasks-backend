import * as admin from "firebase-admin";
import {IVerificadorToken, UsuarioDecodificado} from "../types/autenticacion.types";

/**
 * Implementación concreta de IVerificadorToken usando Firebase Admin
 * Adaptador que encapsula la dependencia de Firebase Authentication
 */
export class VerificadorTokenFirebase implements IVerificadorToken {
  async verificarToken(token: string): Promise<UsuarioDecodificado> {
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      return {
        uid: decodedToken.uid,
        email: decodedToken.email,
      };
    } catch (error) {
      throw new Error("Token inválido o expirado");
    }
  }
}
