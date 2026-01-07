import * as _firestore from "@google-cloud/firestore";

export interface Tarea {
  id: string;
  titulo: string;
  descripcion: string;
  estado: "P" | "C"; // 'P' (Pendiente) o 'C' (Completada)
  fecha_de_creacion: _firestore.Timestamp;
  // Ruta al documento del usuario: /usuarios/<id>
  usuario: string;
}

export type CrearTarea = Omit<Tarea, "id">;

// Payload que envía el cliente para crear una tarea (sin fecha ni usuario)
export type CrearTareaPayload = Pick<Tarea, "titulo" | "descripcion" | "estado">;
