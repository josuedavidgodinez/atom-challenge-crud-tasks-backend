/**
 * Tests para TareaService
 */

import {TareaService} from "../../src/services/tarea.service";
import {TareaModel} from "../../src/models/tarea.model";
import {BasedeDatos, ITiempo} from "../../src/types";
import {Tarea, CrearTareaPayload, EstadoTarea} from "../../src/types/tarea.types";
import {Timestamp} from "@google-cloud/firestore";

describe("TareaService", () => {
  let tareaService: TareaService;
  let mockDb: jest.Mocked<BasedeDatos>;
  let mockTiempo: jest.Mocked<ITiempo>;
  let mockObtenerPorUsuario: jest.Mock;
  let mockObtenerPorId: jest.Mock;
  let mockCrear: jest.Mock;
  let mockActualizar: jest.Mock;
  let mockEliminar: jest.Mock;

  const usuarioId = "user123";
  const tareaId = "task456";
  const mockTimestamp = Timestamp.now();

  beforeEach(() => {
    jest.clearAllMocks();
    mockDb = {} as jest.Mocked<BasedeDatos>;
    mockTiempo = {
      ahora: jest.fn().mockReturnValue(mockTimestamp),
    } as jest.Mocked<ITiempo>;

    mockObtenerPorUsuario = jest.fn();
    mockObtenerPorId = jest.fn();
    mockCrear = jest.fn();
    mockActualizar = jest.fn();
    mockEliminar = jest.fn();

    jest.spyOn(TareaModel.prototype, "obtenerPorUsuario").mockImplementation(mockObtenerPorUsuario);
    jest.spyOn(TareaModel.prototype, "obtenerPorId").mockImplementation(mockObtenerPorId);
    jest.spyOn(TareaModel.prototype, "crear").mockImplementation(mockCrear);
    jest.spyOn(TareaModel.prototype, "actualizar").mockImplementation(mockActualizar);
    jest.spyOn(TareaModel.prototype, "eliminar").mockImplementation(mockEliminar);

    tareaService = new TareaService(mockDb, mockTiempo);
  });

  describe("obtenerTareasPorUsuario", () => {
    it("debe obtener tareas del usuario", async () => {
      const tareas = [{id: "1", titulo: "Tarea 1"}] as Tarea[];
      mockObtenerPorUsuario.mockResolvedValue(tareas);

      const resultado = await tareaService.obtenerTareasPorUsuario(usuarioId);

      expect(resultado.exito).toBe(true);
      expect(resultado.datos).toEqual(tareas);
    });

    it("debe rechazar usuario ID vacío", async () => {
      const resultado = await tareaService.obtenerTareasPorUsuario("");
      expect(resultado.exito).toBe(false);
    });
  });

  describe("crearTarea", () => {
    it("debe crear tarea con datos válidos", async () => {
      mockCrear.mockResolvedValue(true);

      const payload: CrearTareaPayload = {
        titulo: "Nueva tarea",
        descripcion: "Descripción",
        estado: "P",
      };

      const resultado = await tareaService.crearTarea(usuarioId, payload);

      expect(resultado.exito).toBe(true);
      expect(mockCrear).toHaveBeenCalledWith(
        expect.objectContaining({
          titulo: "Nueva tarea",
          descripcion: "Descripción",
          estado: "P",
        })
      );
    });

    it("debe normalizar título y descripción", async () => {
      mockCrear.mockResolvedValue(true);

      await tareaService.crearTarea(usuarioId, {
        titulo: "  Título con espacios  ",
        descripcion: "  Descripción  ",
        estado: "C",
      });

      expect(mockCrear).toHaveBeenCalledWith(
        expect.objectContaining({
          titulo: "Título con espacios",
          descripcion: "Descripción",
        })
      );
    });

    it("debe rechazar datos inválidos", async () => {
      const casosInvalidos = [
        {usuarioId: "", payload: {titulo: "Test", estado: "P"}},
        {usuarioId: usuarioId, payload: {titulo: "", estado: "P"}},
        {usuarioId: usuarioId, payload: {titulo: "Test", estado: "X"}},
      ];

      for (const caso of casosInvalidos) {
        const resultado = await tareaService.crearTarea(
          caso.usuarioId,
          caso.payload as CrearTareaPayload
        );
        expect(resultado.exito).toBe(false);
      }
    });
  });

  describe("actualizarTarea", () => {
    const tareaMock: Tarea = {
      id: tareaId,
      titulo: "Original",
      descripcion: "Descripción",
      estado: "P",
      fecha_de_creacion: mockTimestamp,
      usuario: `/usuarios/${usuarioId}`,
    };

    it("debe actualizar tarea del usuario", async () => {
      mockObtenerPorId.mockResolvedValue(tareaMock);
      mockActualizar.mockResolvedValue(true);

      const resultado = await tareaService.actualizarTarea(usuarioId, tareaId, {
        titulo: "Actualizado",
      });

      expect(resultado.exito).toBe(true);
      expect(mockActualizar).toHaveBeenCalledWith(tareaId, {titulo: "Actualizado"});
    });

    it("debe rechazar si la tarea no existe o no pertenece al usuario", async () => {
      mockObtenerPorId.mockResolvedValue(null);
      let resultado = await tareaService.actualizarTarea(usuarioId, tareaId, {titulo: "Test"});
      expect(resultado.exito).toBe(false);

      mockObtenerPorId.mockResolvedValue({...tareaMock, usuario: "/usuarios/otro"});
      resultado = await tareaService.actualizarTarea(usuarioId, tareaId, {titulo: "Test"});
      expect(resultado.exito).toBe(false);
    });

    it("debe rechazar datos inválidos", async () => {
      mockObtenerPorId.mockResolvedValue(tareaMock);

      expect((await tareaService.actualizarTarea("", tareaId, {titulo: "Test"})).exito).toBe(false);
      expect((await tareaService.actualizarTarea(usuarioId, "", {titulo: "Test"})).exito).toBe(false);
      expect((await tareaService.actualizarTarea(usuarioId, tareaId, {titulo: ""})).exito).toBe(false);
      expect((await tareaService.actualizarTarea(usuarioId, tareaId, {estado: "X" as EstadoTarea})).exito).toBe(false);
      expect((await tareaService.actualizarTarea(usuarioId, tareaId, {})).exito).toBe(false);
    });
  });

  describe("eliminarTarea", () => {
    const tareaMock: Tarea = {
      id: tareaId,
      titulo: "Tarea",
      descripcion: "",
      estado: "P",
      fecha_de_creacion: mockTimestamp,
      usuario: `/usuarios/${usuarioId}`,
    };

    it("debe eliminar tarea del usuario", async () => {
      mockObtenerPorId.mockResolvedValue(tareaMock);
      mockEliminar.mockResolvedValue(true);

      const resultado = await tareaService.eliminarTarea(usuarioId, tareaId);

      expect(resultado.exito).toBe(true);
      expect(mockEliminar).toHaveBeenCalledWith(tareaId);
    });

    it("debe rechazar si la tarea no existe o no pertenece al usuario", async () => {
      mockObtenerPorId.mockResolvedValue(null);
      let resultado = await tareaService.eliminarTarea(usuarioId, tareaId);
      expect(resultado.exito).toBe(false);

      mockObtenerPorId.mockResolvedValue({...tareaMock, usuario: "/usuarios/otro"});
      resultado = await tareaService.eliminarTarea(usuarioId, tareaId);
      expect(resultado.exito).toBe(false);
    });
  });
});
