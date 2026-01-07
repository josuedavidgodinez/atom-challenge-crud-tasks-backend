import * as admin from "firebase-admin";
import {BasedeDatos} from "../types";
import * as _firestore from "@google-cloud/firestore";

/**
 * Implementación Singleton de BasedeDatos para Firestore
 */
class DatabaseFirestore implements BasedeDatos {
  private static instancia: DatabaseFirestore;
  private db: _firestore.Firestore;
  private conectado: boolean = false;

  /**
   * Constructor privado para prevenir instanciación directa
   */
  private constructor() {
    try {
        this.db = admin.firestore();
        this.conectado = true;
    } catch (error) {
        console.error("Error al conectar a Firestore:", error);
    }
  }

  /**
   * Obtiene la única instancia de DatabaseFirestore
   */
  public static obtenerInstancia(): DatabaseFirestore {
    if (!DatabaseFirestore.instancia) {
      DatabaseFirestore.instancia = new DatabaseFirestore();
    }
    return DatabaseFirestore.instancia;
  }

    /**
     * Obtiene datos de una ruta con query
     */
    public async obtenerDatos<T, Q>(ruta: string, query: Q): Promise<T | T[] | null> {
        try {
            const ref = this.db.collection(ruta);
            let consulta: _firestore.Query = ref;

            // Aplicar filtros si existen en el objeto query
            if (query && typeof query === "object") {
                Object.entries(query).forEach(([campo, valor]) => {
                    consulta = consulta.where(campo, "==", valor);
                });
            }

            const snapshot = await consulta.get();

            if (snapshot.empty) {
                return null;
            }

            // Retornar el primer documento encontrado
            const {docs} = snapshot;
            if (docs.length > 1) {
                return docs.map((doc) => ({id: doc.id, ...doc.data()} as T));
            }
            return {id: docs[0].id, ...docs[0].data()} as T;
        } catch (error) {
            console.error(`Error al obtener datos de ${ruta}:`, error);
            throw error;
        }
    }

    /**
     * Guarda datos en una ruta
     */
    public async guardarDatos<T>(ruta: string, datos: T): Promise<boolean> {
        try {
            await this.db.collection(ruta).add(datos);
            console.log(`Datos guardados en ${ruta}`);
            return true;
        } catch (error) {
            console.error(`Error al guardar datos en ${ruta}:`, error);
            return false;
        }
    }

    /**
     * Elimina datos por ID
     */
    public async eliminarDatos<I>(ruta: string, id: I): Promise<boolean> {
        try {
            await this.db.collection(ruta).doc(String(id)).delete();
            console.log(`Datos eliminados de ${ruta}`);
            return true;
        } catch (error) {
            console.error(`Error al eliminar datos de ${ruta}:`, error);
            return false;
        }
    }

    /**
     * Actualiza datos en una ruta
     */
    public async actualizarDatos<T, I>(ruta: string, datos: Partial<T>, id: I): Promise<void> {
        try {
            // Suponiendo que los datos contienen un 'id' para identificar el documento
            if (!id) {
                throw new Error("El objeto debe contener un ID para actualizar");
            }
            await this.db.collection(ruta).doc(String(id)).update(datos);
            console.log(`Datos actualizados en ${ruta}`);
        } catch (error) {
            console.error(`Error al actualizar datos en ${ruta}:`, error);
            throw error;
        }
    }
}

export {DatabaseFirestore};
