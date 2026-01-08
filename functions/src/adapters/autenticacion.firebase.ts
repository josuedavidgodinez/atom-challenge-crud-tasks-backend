import * as admin from "firebase-admin";
import {IAutenticacion} from "../types/autenticacion.types";

/**
 * Implementación concreta de IAutenticacion usando Firebase Admin
 * Adaptador que encapsula la dependencia de Firebase
 */
export class AutenticacionFirebase implements IAutenticacion {
  async crearUsuario(email: string): Promise<string> {
    const userRecord = await admin.auth().createUser({
      email,
      emailVerified: true,
    });
    return userRecord.uid;
  }

  async crearTokenPersonalizado(uid: string, claims?: Record<string, unknown>): Promise<string> {
    return admin.auth().createCustomToken(uid, claims);
  }
}
