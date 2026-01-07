export interface Tarea {
  id: string;
  titulo: string;
  descripcion: string;
  estado: "P" | "C"; // 'P' (Pendiente) o 'C' (Completada)
  fecha_de_creacion: unknown; // Independiente del framework - puede ser Timestamp, Date, etc.
  // Ruta al documento del usuario: /usuarios/<id>
  usuario: string;
}

export type CrearTarea = Omit<Tarea, "id">;

// Payload que envía el cliente para crear una tarea (sin fecha ni usuario)
export type CrearTareaPayload = Pick<Tarea, "titulo" | "descripcion" | "estado">;

// Payload que envía el cliente para actualizar una tarea (campos opcionales)
export type ActualizarTareaPayload = Partial<Pick<Tarea, "titulo" | "descripcion" | "estado">>;
