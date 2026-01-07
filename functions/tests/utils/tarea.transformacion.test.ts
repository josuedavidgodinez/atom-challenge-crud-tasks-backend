/**
 * Tests para transformaciones de tarea
 */

import {
  construirPathUsuario,
  normalizarTexto,
} from "../../src/utils/transformaciones/tarea.transformacion";

describe("Transformaciones de Tarea", () => {
  describe("construirPathUsuario", () => {
    it("debe construir el path correcto", () => {
      expect(construirPathUsuario("user123")).toBe("/usuarios/user123");
    });
  });

  describe("normalizarTexto", () => {
    it("debe eliminar espacios extremos y manejar undefined", () => {
      expect(normalizarTexto("  Texto  ")).toBe("Texto");
      expect(normalizarTexto("Texto")).toBe("Texto");
      expect(normalizarTexto("   ")).toBe("");
      expect(normalizarTexto(undefined)).toBe("");
    });
  });
});
