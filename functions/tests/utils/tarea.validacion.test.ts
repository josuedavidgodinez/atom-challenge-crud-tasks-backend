/**
 * Tests para validaciones de tarea
 */

import {
  validarIdRequerido,
  validarTituloRequerido,
  validarEstado,
  validarPropiedadTarea
} from "../../src/utils/validaciones/tarea.validacion";

describe("Validaciones de Tarea", () => {
  describe("validarIdRequerido", () => {
    it("debe validar IDs correctos", () => {
      expect(validarIdRequerido("id123", "ID").valido).toBe(true);
    });

    it("debe rechazar IDs vacíos con mensaje personalizado", () => {
      const resultado = validarIdRequerido("", "ID de usuario");
      expect(resultado.valido).toBe(false);
      expect(resultado.mensaje).toBe("El ID de usuario es requerido");
    });
  });

  describe("validarTituloRequerido", () => {
    it("debe validar títulos correctos", () => {
      expect(validarTituloRequerido("Mi tarea").valido).toBe(true);
    });

    it("debe rechazar títulos vacíos", () => {
      expect(validarTituloRequerido("").valido).toBe(false);
      expect(validarTituloRequerido("   ").valido).toBe(false);
      expect(validarTituloRequerido(null).valido).toBe(false);
    });
  });

  describe("validarEstado", () => {
    it("debe validar estados P y C", () => {
      expect(validarEstado("P").valido).toBe(true);
      expect(validarEstado("C").valido).toBe(true);
    });

    it("debe rechazar estados inválidos", () => {
      expect(validarEstado("X").valido).toBe(false);
      expect(validarEstado("").valido).toBe(false);
      expect(validarEstado("p").valido).toBe(false);
    });
  });

  describe("validarPropiedadTarea", () => {
    it("debe validar cuando los paths coinciden", () => {
      expect(validarPropiedadTarea("/usuarios/user123", "/usuarios/user123").valido).toBe(true);
    });

    it("debe rechazar cuando los paths no coinciden", () => {
      expect(validarPropiedadTarea("/usuarios/user1", "/usuarios/user2").valido).toBe(false);
    });
  });
});
