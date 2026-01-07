/**
 * Setup para tests de integración con Firebase Emulator Suite
 */
import * as admin from "firebase-admin";

// Variables globales para los emuladores
export const EMULATOR_CONFIG = {
  projectId: "atom-challenge-crud-tasks",
  firestore: {
    host: "localhost",
    port: 8080,
  },
  auth: {
    host: "localhost",
    port: 9099,
  },
};

/**
 * Inicializa Firebase Admin SDK para usar con emuladores
 */
export function initializeFirebaseForTests() {
  // Configurar variables de entorno para emuladores
  process.env.FIRESTORE_EMULATOR_HOST = `${EMULATOR_CONFIG.firestore.host}:${EMULATOR_CONFIG.firestore.port}`;
  process.env.FIREBASE_AUTH_EMULATOR_HOST = `${EMULATOR_CONFIG.auth.host}:${EMULATOR_CONFIG.auth.port}`;
  process.env.GCLOUD_PROJECT = EMULATOR_CONFIG.projectId;

  // Inicializar Firebase Admin si no está inicializado
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: EMULATOR_CONFIG.projectId,
    });
  }

  return admin;
}

/**
 * Limpia todos los datos de Firestore en los emuladores
 */
export async function clearFirestore() {
  const db = admin.firestore();
  const collections = await db.listCollections();

  const deletePromises = collections.map(async (collection) => {
    const snapshot = await collection.get();
    const batchDeletes: Promise<admin.firestore.WriteResult>[] = [];

    snapshot.docs.forEach((doc) => {
      batchDeletes.push(doc.ref.delete());
    });

    return Promise.all(batchDeletes);
  });

  await Promise.all(deletePromises);
}

/**
 * Limpia todos los usuarios de Auth en los emuladores
 */
export async function clearAuth() {
  try {
    const listUsersResult = await admin.auth().listUsers();
    const deletePromises = listUsersResult.users.map((user) =>
      admin.auth().deleteUser(user.uid)
    );
    await Promise.all(deletePromises);
  } catch (error) {
    // Si no hay usuarios, continuar
    console.log("No hay usuarios para limpiar");
  }
}

/**
 * Limpia todos los datos antes de cada test
 */
export async function cleanupDatabase() {
  await clearFirestore();
  await clearAuth();
}

/**
 * Crea un usuario de prueba en Auth
 */
export async function createTestUser(email: string) {
  const userRecord = await admin.auth().createUser({
    email,
    emailVerified: true,
    disabled: false,
  });

  return userRecord;
}

/**
 * Genera un custom token para un usuario
 */
export async function generateCustomToken(uid: string, claims?: object) {
  return admin.auth().createCustomToken(uid, claims);
}

/**
 * Convierte un custom token en un ID token (simulado para tests)
 */
export async function getIdTokenFromCustomToken(customToken: string): Promise<string> {
  // En el emulador, el custom token sirve como ID token para propósitos de testing
  // En producción usarías la REST API de Firebase Auth
  return customToken;
}
