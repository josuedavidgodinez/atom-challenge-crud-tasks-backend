/**
 * Validaciones relacionadas con correos electrónicos
 */

/**
 * Regex para validar formato de correo electrónico
 */
export const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida que un correo no esté vacío
 */
export function validarEmailRequerido(email: string | undefined | null): {
  valido: boolean;
  mensaje?: string;
} {
  if (!email || email.trim() === "") {
    return {
      valido: false,
      mensaje: "El correo electrónico es requerido",
    };
  }
  return {valido: true};
}

/**
 * Valida el formato de un correo electrónico
 */
export function validarFormatoEmail(email: string): {
  valido: boolean;
  mensaje?: string;
} {
  if (!REGEX_EMAIL.test(email)) {
    return {
      valido: false,
      mensaje: "El formato del correo electrónico no es válido",
    };
  }
  return {valido: true};
}

/**
 * Valida que el correo sea válido (requerido + formato)
 */
export function validarEmail(email: string | undefined | null): {
  valido: boolean;
  mensaje?: string;
} {
  const validacionRequerido = validarEmailRequerido(email);
  if (!validacionRequerido.valido) {
    return validacionRequerido;
  }

  return validarFormatoEmail(email!);
}
