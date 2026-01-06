/**
 * Tipo que define la estructura de un usuario
 */
export interface Usuario {
  id: string;
  correo: string;
}

/**
 * Tipo para crear un nuevo usuario (sin id)
 */
export type CrearUsuario = Omit<Usuario, "id">;
