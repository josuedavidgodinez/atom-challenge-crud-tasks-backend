import {defineString} from "firebase-functions/params";
import cors from "cors";

/**
 * Variable de entorno para CORS (Firebase Functions v2)
 *
 * En desarrollo local: Usar archivo .env con CORS_ORIGIN=*
 * En producción: Configurar en Firebase antes del deploy:
 *   firebase deploy --only functions
 *   (Te preguntará el valor si no está configurado)
 *
 * Para CI/CD: Configurar en GitHub Secrets y pasar al deploy
 */
export const corsOrigin = defineString("CORS_ORIGIN", {
  description: "Orígenes permitidos para CORS. Usa '*' para desarrollo o URLs específicas para producción (ej: https://mi-app.com)",
  default: "*", // Valor por defecto para desarrollo
});

/**
 * Obtiene los orígenes permitidos según la configuración
 */
const obtenerOrigenesPermitidos = (): string | string[] | boolean => {
  const origin = corsOrigin.value();
  // Si no está configurado o es "*", permitir todos los orígenes (desarrollo)
  if (!origin || origin === "*") {
    return true;
  }
  // Si hay múltiples orígenes separados por coma
  if (origin.includes(",")) {
    return origin.split(",").map((o) => o.trim());
  }
  // Un solo origen específico
  return origin;
};

/**
 * Handler de CORS configurado según el entorno
 * Usa la variable de entorno CORS_ORIGIN definida con defineString
 */
export const corsHandler = cors({
  origin: obtenerOrigenesPermitidos(),
  credentials: true,
});

/**
 * Configuración de CORS para desarrollo (acepta todo)
 * Útil para testing o funciones específicas que necesiten acceso público
 */
export const corsHandlerDesarrollo = cors({
  origin: true,
  credentials: true,
});
