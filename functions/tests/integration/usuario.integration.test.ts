/**
 * Tests de integración para funciones de usuario
 * Basados en la colección de Postman
 */

import {
  initializeFirebaseForTests,
  cleanupDatabase,
} from "./setup";
import {FunctionsHttpClient} from "./utils/http-client";

describe("Usuario Integration Tests", () => {
  let httpClient: FunctionsHttpClient;

  beforeAll(() => {
    initializeFirebaseForTests();
    httpClient = new FunctionsHttpClient();
  });

  beforeEach(async () => {
    await cleanupDatabase();
  });

  describe("POST /crearUsuario", () => {
    it("debe crear un usuario exitosamente (crearUsuarioOk)", async () => {
      // Arrange
      const nuevoUsuario = {
        correo: "test@example.com",
      };

      // Act
      const response = await httpClient.post("crearUsuario", nuevoUsuario);

      // Assert
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("exito", true);
      expect(response.data).toHaveProperty("mensaje", "Usuario creado exitosamente");
    });

    it("debe fallar al crear un usuario con correo duplicado (crearUsuarioKO)", async () => {
      // Arrange - Crear usuario primero
      const correo = "duplicado@example.com";
      await httpClient.post("crearUsuario", {correo});

      // Act - Intentar crear el mismo usuario de nuevo
      const response = await httpClient.post("crearUsuario", {correo});

      // Assert
      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty("exito", false);
      expect(response.data).toHaveProperty("mensaje", "El correo electrónico ya está registrado");
    });

    it("debe fallar si el correo no es proporcionado", async () => {
      // Act
      const response = await httpClient.post("crearUsuario", {});

      // Assert
      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty("exito", false);
    });

    it("debe fallar si el correo tiene formato inválido", async () => {
      // Arrange
      const usuarioInvalido = {
        correo: "correo-invalido",
      };

      // Act
      const response = await httpClient.post("crearUsuario", usuarioInvalido);

      // Assert
      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty("exito", false);
    });
  });

  describe("POST /loginUsuario", () => {
    it("debe hacer login exitosamente con usuario existente (loginUsuarioOk)", async () => {
      // Arrange - Crear usuario primero
      const correo = "login@example.com";
      await httpClient.post("crearUsuario", {correo});

      // Act
      const response = await httpClient.post("loginUsuario", {correo});

      // Assert
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("exito", true);
      expect(response.data).toHaveProperty("token");
      expect(response.data).toHaveProperty("usuario");
      expect(response.data).toHaveProperty("mensaje", "Login exitoso");
      expect(response.data.usuario).toHaveProperty("id");
      expect(response.data.usuario).toHaveProperty("correo", correo);
    });

    it("debe fallar al hacer login con usuario no existente (loginUsuarioKO)", async () => {
      // Act
      const response = await httpClient.post("loginUsuario", {
        correo: "noexiste@example.com",
      });

      // Assert
      expect(response.status).toBe(401);
      expect(response.data).toHaveProperty("exito", false);
      expect(response.data).toHaveProperty("mensaje", "Usuario no encontrado");
    });

    it("debe fallar si el correo no es proporcionado", async () => {
      // Act
      const response = await httpClient.post("loginUsuario", {});

      // Assert
      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty("exito", false);
    });
  });

  describe("Flujo completo de registro y login", () => {
    it("debe poder registrar un usuario y luego hacer login", async () => {
      // Arrange
      const correo = "flujo@example.com";

      // Act 1 - Registro
      const registroResponse = await httpClient.post("crearUsuario", {correo});

      // Assert 1
      expect(registroResponse.status).toBe(200);
      expect(registroResponse.data.exito).toBe(true);

      // Act 2 - Login
      const loginResponse = await httpClient.post("loginUsuario", {correo});

      // Assert 2
      expect(loginResponse.status).toBe(200);
      expect(loginResponse.data.exito).toBe(true);
      expect(loginResponse.data.token).toBeDefined();
      expect(loginResponse.data.usuario.correo).toBe(correo);
    });
  });
});
