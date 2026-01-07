/**
 * Tests de integración para funciones de tareas
 * Basados en la colección de Postman
 */

import {
  initializeFirebaseForTests,
  cleanupDatabase,
} from "./setup";
import {FunctionsHttpClient} from "./utils/http-client";

describe("Tarea Integration Tests", () => {
  let httpClient: FunctionsHttpClient;
  let authToken: string;

  beforeAll(() => {
    initializeFirebaseForTests();
    httpClient = new FunctionsHttpClient();
  });

  beforeEach(async () => {
    await cleanupDatabase();

    // Crear usuario y obtener token para los tests
    const correo = "tarea-test@example.com";
    await httpClient.post("crearUsuario", {correo});

    const loginResponse = await httpClient.post("loginUsuario", {correo});
    authToken = loginResponse.data.token;

    // Configurar token en el cliente
    httpClient.setAuthToken(authToken);
  });

  afterEach(() => {
    httpClient.clearAuthToken();
  });

  describe("POST /crearTarea", () => {
    it("debe crear una tarea exitosamente (crearTareaOk)", async () => {
      // Arrange
      const nuevaTarea = {
        titulo: "Hacer la cama",
        descripcion: "Tender la cama todos los días",
        estado: "P",
      };

      // Act
      const response = await httpClient.post("crearTarea", nuevaTarea);

      // Assert
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("exito", true);
      expect(response.data).toHaveProperty("mensaje", "Tarea creada exitosamente");
    });

    it("debe fallar al crear una tarea sin título (crearTareaKO)", async () => {
      // Arrange
      const tareaInvalida = {
        titulo: "",
        descripcion: "Descripción sin título",
        estado: "P",
      };

      // Act
      const response = await httpClient.post("crearTarea", tareaInvalida);

      // Assert
      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty("exito", false);
      expect(response.data).toHaveProperty("mensaje", "El título es requerido");
    });

    it("debe fallar al crear una tarea sin autenticación", async () => {
      // Arrange
      httpClient.clearAuthToken();
      const nuevaTarea = {
        titulo: "Tarea sin auth",
        descripcion: "No debería crearse",
        estado: "P",
      };

      // Act
      const response = await httpClient.post("crearTarea", nuevaTarea);

      // Assert
      expect(response.status).toBe(401);
      expect(response.data).toHaveProperty("exito", false);
    });

    it("debe crear una tarea con todos los campos requeridos", async () => {
      // Arrange
      const nuevaTarea = {
        titulo: "Lavar el carro",
        descripcion: "Lavar el carro el sábado",
        estado: "P",
      };

      // Act
      const response = await httpClient.post("crearTarea", nuevaTarea);

      // Assert
      expect(response.status).toBe(200);
      expect(response.data.exito).toBe(true);
    });

    it("debe validar el estado de la tarea", async () => {
      // Arrange
      const tareaEstadoInvalido = {
        titulo: "Tarea con estado inválido",
        descripcion: "Estado no permitido",
        estado: "X", // Estado inválido
      };

      // Act
      const response = await httpClient.post("crearTarea", tareaEstadoInvalido);

      // Assert
      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty("exito", false);
    });
  });

  describe("GET /obtenerTareasPorUsuario", () => {
    it("debe obtener tareas del usuario exitosamente (obtenerTareasPorUsuarioOK)", async () => {
      // Arrange - Crear algunas tareas primero
      await httpClient.post("crearTarea", {
        titulo: "Tarea 1",
        descripcion: "Primera tarea",
        estado: "P",
      });

      await httpClient.post("crearTarea", {
        titulo: "Tarea 2",
        descripcion: "Segunda tarea",
        estado: "P",
      });

      // Act
      const response = await httpClient.get("obtenerTareasPorUsuario");

      // Assert
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("exito", true);
      expect(response.data).toHaveProperty("datos");
      expect(response.data).toHaveProperty("mensaje", "Se han encontrado tareas");
      expect(Array.isArray(response.data.datos)).toBe(true);
      expect(response.data.datos.length).toBeGreaterThanOrEqual(2);

      // Verificar estructura de las tareas
      const tarea = response.data.datos[0];
      expect(tarea).toHaveProperty("id");
      expect(tarea).toHaveProperty("titulo");
      expect(tarea).toHaveProperty("descripcion");
      expect(tarea).toHaveProperty("estado");
      expect(tarea).toHaveProperty("fecha_de_creacion");
      expect(tarea).toHaveProperty("usuario");
    });

    it("debe fallar al obtener tareas sin autenticación (obtenerTareasPorUsuarioKO)", async () => {
      // Arrange
      httpClient.clearAuthToken();

      // Act
      const response = await httpClient.get("obtenerTareasPorUsuario");

      // Assert
      expect(response.status).toBe(401);
      expect(response.data).toHaveProperty("exito", false);
      expect(response.data).toHaveProperty("mensaje", "Token de autenticación no proporcionado");
    });

    it("debe retornar lista vacía cuando el usuario no tiene tareas", async () => {
      // Act - Sin crear tareas
      const response = await httpClient.get("obtenerTareasPorUsuario");

      // Assert
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("exito", true);
      expect(response.data).toHaveProperty("datos");
      expect(Array.isArray(response.data.datos)).toBe(true);
      expect(response.data.datos.length).toBe(0);
    });

    it("debe retornar solo las tareas del usuario autenticado", async () => {
      // Arrange - Crear tareas con este usuario
      await httpClient.post("crearTarea", {
        titulo: "Mi tarea",
        descripcion: "Tarea del usuario autenticado",
        estado: "P",
      });

      // Crear otro usuario con su tarea
      const otroCorreo = "otro@example.com";
      await httpClient.post("crearUsuario", {correo: otroCorreo});
      const otroLogin = await httpClient.post("loginUsuario", {correo: otroCorreo});

      httpClient.setAuthToken(otroLogin.data.token);
      await httpClient.post("crearTarea", {
        titulo: "Tarea de otro",
        descripcion: "Tarea de otro usuario",
        estado: "P",
      });

      // Act - Volver al usuario original
      httpClient.setAuthToken(authToken);
      const response = await httpClient.get("obtenerTareasPorUsuario");

      // Assert - Solo debe retornar la tarea del usuario original
      expect(response.status).toBe(200);
      expect(response.data.datos.length).toBe(1);
      expect(response.data.datos[0].titulo).toBe("Mi tarea");
    });
  });

  describe("PUT /actualizartarea", () => {
    let tareaId: string;

    beforeEach(async () => {
      // Crear una tarea para actualizar
      await httpClient.post("crearTarea", {
        titulo: "Tarea para actualizar",
        descripcion: "Descripción original",
        estado: "P",
      });

      // Obtener el ID de la tarea
      const tareasResponse = await httpClient.get("obtenerTareasPorUsuario");
      tareaId = tareasResponse.data.datos[0].id;
    });

    it("debe actualizar una tarea exitosamente (actualizartareaOK)", async () => {
      // Arrange
      const actualizacion = {
        tareaId,
        titulo: "Tarea actualizada",
        descripcion: "Descripción actualizada",
        estado: "C", // Completada
      };

      // Act
      const response = await httpClient.put("actualizarTarea", actualizacion);

      // Assert
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("exito", true);
      expect(response.data).toHaveProperty("mensaje", "Tarea actualizada exitosamente");

      // Verificar que la tarea se actualizó
      const tareasResponse = await httpClient.get("obtenerTareasPorUsuario");
      const tareaActualizada = tareasResponse.data.datos.find((t: {id: string}) => t.id === tareaId);
      expect(tareaActualizada.titulo).toBe("Tarea actualizada");
      expect(tareaActualizada.descripcion).toBe("Descripción actualizada");
      expect(tareaActualizada.estado).toBe("C");
    });

    it("debe fallar al actualizar una tarea inexistente (actualizartareaKO)", async () => {
      // Arrange
      const actualizacion = {
        tareaId: "id-inexistente-123",
        titulo: "Tarea inexistente",
        descripcion: "No existe",
        estado: "P",
      };

      // Act
      const response = await httpClient.put("actualizarTarea", actualizacion);

      // Assert
      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty("exito", false);
      expect(response.data).toHaveProperty("mensaje", "Tarea no encontrada");
    });

    it("debe fallar al actualizar sin autenticación", async () => {
      // Arrange
      httpClient.clearAuthToken();
      const actualizacion = {
        tareaId,
        titulo: "Actualización sin auth",
        descripcion: "No debería funcionar",
        estado: "P",
      };

      // Act
      const response = await httpClient.put("actualizarTarea", actualizacion);

      // Assert
      expect(response.status).toBe(401);
      expect(response.data).toHaveProperty("exito", false);
    });

    it("no debe permitir actualizar tarea de otro usuario", async () => {
      // Arrange - Crear otro usuario
      const otroCorreo = "otro-usuario@example.com";
      await httpClient.post("crearUsuario", {correo: otroCorreo});
      const otroLogin = await httpClient.post("loginUsuario", {correo: otroCorreo});

      // Intentar actualizar con el otro usuario
      httpClient.setAuthToken(otroLogin.data.token);
      const actualizacion = {
        tareaId, // ID de tarea del primer usuario
        titulo: "Intento de actualizar tarea ajena",
        descripcion: "No debería funcionar",
        estado: "P",
      };

      // Act
      const response = await httpClient.put("actualizarTarea", actualizacion);

      // Assert
      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty("exito", false);
    });
  });

  describe("DELETE /eliminartarea", () => {
    let tareaId: string;

    beforeEach(async () => {
      // Crear una tarea para eliminar
      await httpClient.post("crearTarea", {
        titulo: "Tarea para eliminar",
        descripcion: "Se eliminará en el test",
        estado: "P",
      });

      // Obtener el ID de la tarea
      const tareasResponse = await httpClient.get("obtenerTareasPorUsuario");
      tareaId = tareasResponse.data.datos[0].id;
    });

    it("debe eliminar una tarea exitosamente (eliminartareaOK)", async () => {
      // Act
      const response = await httpClient.delete("eliminarTarea", {tareaId});

      // Assert
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("exito", true);
      expect(response.data).toHaveProperty("mensaje", "Tarea eliminada exitosamente");

      // Verificar que la tarea ya no existe
      const tareasResponse = await httpClient.get("obtenerTareasPorUsuario");
      const tareaEliminada = tareasResponse.data.datos.find((t: {id: string}) => t.id === tareaId);
      expect(tareaEliminada).toBeUndefined();
    });

    it("debe fallar al eliminar una tarea inexistente (eliminartareaKO)", async () => {
      // Act
      const response = await httpClient.delete("eliminarTarea", {
        tareaId: "id-inexistente-456",
      });

      // Assert
      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty("exito", false);
      expect(response.data).toHaveProperty("mensaje", "Tarea no encontrada");
    });

    it("debe fallar al eliminar sin autenticación", async () => {
      // Arrange
      httpClient.clearAuthToken();

      // Act
      const response = await httpClient.delete("eliminarTarea", {tareaId});

      // Assert
      expect(response.status).toBe(401);
      expect(response.data).toHaveProperty("exito", false);
    });

    it("no debe permitir eliminar tarea de otro usuario", async () => {
      // Arrange - Crear otro usuario
      const otroCorreo = "eliminar-otro@example.com";
      await httpClient.post("crearUsuario", {correo: otroCorreo});
      const otroLogin = await httpClient.post("loginUsuario", {correo: otroCorreo});

      // Intentar eliminar con el otro usuario
      httpClient.setAuthToken(otroLogin.data.token);

      // Act
      const response = await httpClient.delete("eliminarTarea", {tareaId});

      // Assert
      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty("exito", false);
    });
  });

  describe("Flujo completo CRUD de tareas", () => {
    it("debe completar el ciclo completo: crear, listar, actualizar y eliminar", async () => {
      // 1. Crear tarea
      const crearResponse = await httpClient.post("crearTarea", {
        titulo: "Tarea ciclo completo",
        descripcion: "Test del flujo completo",
        estado: "P",
      });
      expect(crearResponse.status).toBe(200);

      // 2. Listar y obtener ID
      const listarResponse = await httpClient.get("obtenerTareasPorUsuario");
      expect(listarResponse.status).toBe(200);
      expect(listarResponse.data.datos.length).toBe(1);

      const tareaId = listarResponse.data.datos[0].id;

      // 3. Actualizar
      const actualizarResponse = await httpClient.put("actualizarTarea", {
        tareaId,
        titulo: "Tarea actualizada",
        descripcion: "Descripción actualizada",
        estado: "C",
      });
      expect(actualizarResponse.status).toBe(200);

      // 4. Verificar actualización
      const verificarResponse = await httpClient.get("obtenerTareasPorUsuario");
      expect(verificarResponse.data.datos[0].titulo).toBe("Tarea actualizada");
      expect(verificarResponse.data.datos[0].estado).toBe("C");

      // 5. Eliminar
      const eliminarResponse = await httpClient.delete("eliminarTarea", {tareaId});
      expect(eliminarResponse.status).toBe(200);

      // 6. Verificar eliminación
      const finalResponse = await httpClient.get("obtenerTareasPorUsuario");
      expect(finalResponse.data.datos.length).toBe(0);
    });
  });
});
