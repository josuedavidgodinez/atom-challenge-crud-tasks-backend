/**
 * Transformaciones de datos relacionadas con tareas
 */

/**
 * Construye el path de usuario para Firestore
 */
export function construirPathUsuario(usuarioId: string): string {
  return `/usuarios/${usuarioId}`;
}

/**
 * Limpia y normaliza un texto (elimina espacios al inicio y final)
 * @param texto - Texto a normalizar (puede ser undefined)
 * @returns Texto normalizado sin espacios al inicio y final
 */
export function normalizarTexto(texto: string | undefined): string {
  return (texto || "").trim();
}
