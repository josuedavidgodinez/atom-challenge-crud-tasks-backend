/**
 * Tests para validaciones de email
 */

import {validarEmail} from "../../src/utils/validaciones/email.validacion";

describe("Validaciones de Email", () => {
  it("debe validar emails correctos", () => {
    expect(validarEmail("test@example.com").valido).toBe(true);
  });

  it("debe rechazar email vacío o inválido", () => {
    expect(validarEmail("").valido).toBe(false);
    expect(validarEmail("   ").valido).toBe(false);
    expect(validarEmail(null).valido).toBe(false);
    expect(validarEmail("invalido").valido).toBe(false);
    expect(validarEmail("@example.com").valido).toBe(false);
  });
});
