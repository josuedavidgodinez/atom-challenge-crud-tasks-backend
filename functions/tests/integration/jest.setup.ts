/**
 * Configuración de setup global para tests de integración
 * Se ejecuta antes de todos los tests
 */

// Aumentar timeout global para tests de integración
jest.setTimeout(30000);

// Configurar variables de entorno para emuladores
process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";
process.env.GCLOUD_PROJECT = "demo-test-project";

// Suprimir advertencias innecesarias en tests
process.env.NODE_ENV = "test";
