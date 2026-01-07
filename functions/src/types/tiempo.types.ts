/**
 * Abstracción para el manejo de timestamps
 * Permite inyectar diferentes implementaciones (Firestore, Date, etc.)
 */
export interface ITiempo {
  /**
   * Retorna el timestamp actual
   */
  ahora(): unknown;
}
