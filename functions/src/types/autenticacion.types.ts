/**
 * Abstracción para el manejo de autenticación
 * Permite inyectar diferentes implementaciones (Firebase Auth, JWT, etc.)
 */
export interface IAutenticacion {
  /**
   * Crea un token personalizado para el usuario
   * @param uid - ID único del usuario
   * @param claims - Claims adicionales para el token
   */
  crearTokenPersonalizado(uid: string, claims?: Record<string, unknown>): Promise<string>;
}
