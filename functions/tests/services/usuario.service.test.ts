/**
 * Tests para UsuarioService
 */

import {UsuarioService} from "../../src/services/usuario.service";
import {UsuarioModel} from "../../src/models/usuario.model";
import {BasedeDatos, IAutenticacion} from "../../src/types";
import {Usuario, CrearUsuario} from "../../src/types/usuario.types";

describe("UsuarioService", () => {
  let usuarioService: UsuarioService;
  let mockDb: jest.Mocked<BasedeDatos>;
  let mockAutenticacion: jest.Mocked<IAutenticacion>;
  let mockObtenerPorQuery: jest.Mock;
  let mockCrear: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDb = {} as jest.Mocked<BasedeDatos>;
    mockAutenticacion = {
      crearTokenPersonalizado: jest.fn(),
    } as jest.Mocked<IAutenticacion>;

    mockObtenerPorQuery = jest.fn();
    mockCrear = jest.fn();

    jest.spyOn(UsuarioModel.prototype, "obtenerPorQuery").mockImplementation(mockObtenerPorQuery);
    jest.spyOn(UsuarioModel.prototype, "crear").mockImplementation(mockCrear);

    usuarioService = new UsuarioService(mockDb, mockAutenticacion);
  });

  describe("crearUsuario", () => {
    it("debe crear usuario con email válido", async () => {
      mockObtenerPorQuery.mockResolvedValue(null);
      mockCrear.mockResolvedValue(true);

      const resultado = await usuarioService.crearUsuario({
        correo: "test@example.com",
        nombre: "Test User"
      } as CrearUsuario);

      expect(resultado.exito).toBe(true);
      expect(mockCrear).toHaveBeenCalled();
    });

    it("debe rechazar emails inválidos", async () => {
      const casosInvalidos = ["", "   ", "invalido", null];
      for (const correo of casosInvalidos) {
        const resultado = await usuarioService.crearUsuario({
          correo: correo as unknown,
          nombre: "Test"
        } as CrearUsuario);
        expect(resultado.exito).toBe(false);
      }
    });

    it("debe rechazar email duplicado", async () => {
      mockObtenerPorQuery.mockResolvedValue({id: "existing"} as Usuario);

      const resultado = await usuarioService.crearUsuario({
        correo: "test@example.com",
        nombre: "Test"
      } as CrearUsuario);

      expect(resultado.exito).toBe(false);
      expect(resultado.mensaje).toBe("El correo electrónico ya está registrado");
    });
  });

  describe("loginUsuario", () => {
    it("debe autenticar usuario exitosamente", async () => {
      const mockUsuario = {id: "user123", correo: "test@example.com"} as Usuario;
      mockObtenerPorQuery.mockResolvedValue(mockUsuario);
      mockAutenticacion.crearTokenPersonalizado.mockResolvedValue("custom-token");

      const resultado = await usuarioService.loginUsuario("test@example.com");

      expect(resultado.exito).toBe(true);
      expect(resultado.token).toBe("custom-token");
    });

    it("debe rechazar email inválido o usuario no encontrado", async () => {
      mockObtenerPorQuery.mockResolvedValue(null);

      expect((await usuarioService.loginUsuario("")).exito).toBe(false);
      expect((await usuarioService.loginUsuario("test@example.com")).exito).toBe(false);
    });
  });
});
