import {Timestamp} from "@google-cloud/firestore";
import {ITiempo} from "../types/tiempo.types";

/**
 * Implementación concreta de ITiempo usando Firestore Timestamp
 * Adaptador que encapsula la dependencia de Firebase
 */
export class TiempoFirestore implements ITiempo {
  ahora() {
    return Timestamp.now();
  }
}
