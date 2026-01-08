/**
 * Información del usuario decodificada del token
 */
export interface UsuarioDecodificado {
  uid: string;
  email?: string;
}

/**
 * Abstracción para verificar tokens de autenticación
 * Permite inyectar diferentes implementaciones (Firebase Auth, JWT, Auth0, etc.)
 */
export interface IVerificadorToken {
  /**
   * Verifica un token de autenticación y retorna la información del usuario
   * @param token - Token a verificar
   * @returns Información del usuario si el token es válido
   * @throws Error si el token es inválido o expirado
   */
  verificarToken(token: string): Promise<UsuarioDecodificado>;
}

/**
 * Abstracción para el manejo de autenticación
 * Permite inyectar diferentes implementaciones (Firebase Auth, JWT, etc.)
 */
export interface IAutenticacion {
  /**
   * Crea un usuario en el sistema de autenticación
   * @param email - Correo electrónico del usuario
   * @returns UID del usuario creado
   */
  crearUsuario(email: string): Promise<string>;

  /**
   * Crea un token personalizado para el usuario
   * @param uid - ID único del usuario
   * @param claims - Claims adicionales para el token
   */
  crearTokenPersonalizado(uid: string, claims?: Record<string, unknown>): Promise<string>;
}
