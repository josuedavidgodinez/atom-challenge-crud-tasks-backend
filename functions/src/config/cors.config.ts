import {defineString} from "firebase-functions/params";
import cors from "cors";
import {Request, Response} from "express";

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
 * Se evalúa en RUNTIME, no durante el deployment
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
 * Handler de CORS que evalúa la configuración en RUNTIME
 * Esto evita el warning de Firebase sobre llamar .value() durante deployment
 */
export const corsHandler = (
  req: Request,
  res: Response,
  next: () => Promise<void>
): void => {
  const handler = cors({
    origin: obtenerOrigenesPermitidos(),
    credentials: true,
  });
  handler(req, res, next);
};

/**
 * Configuración de CORS para desarrollo (acepta todo)
 * Útil para testing o funciones específicas que necesiten acceso público
 */
export const corsHandlerDesarrollo = cors({
  origin: true,
  credentials: true,
});
