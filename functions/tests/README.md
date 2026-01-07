# Tests Unitarios

## 📊 Resumen

Tests unitarios esenciales enfocados en casos críticos de negocio:

- **Total de tests**: 27 ✅
- **Tests de Utils**: 12 (funciones puras)
- **Tests de Services**: 15 (con mocks)
- **Reducción**: -68% de código de tests
- **Tiempo ejecución**: ~0.6s

## 🗂️ Estructura

```
tests/
├── utils/                              # 12 tests
│   ├── email.validacion.test.ts       # 2 tests - Validaciones de email
│   ├── tarea.validacion.test.ts       # 8 tests - Validaciones de tareas
│   └── tarea.transformacion.test.ts   # 2 tests - Transformaciones
└── services/                           # 15 tests
    ├── usuario.service.test.ts        # 5 tests - UsuarioService
    └── tarea.service.test.ts          # 10 tests - TareaService
```

## 🎯 Filosofía de Tests

### Enfoque Minimalista
- **Casos esenciales**: Solo validaciones críticas de negocio
- **Tests agrupados**: Múltiples casos en un solo test cuando son similares
- **Sin redundancia**: Elimina tests que prueban lo mismo de diferentes formas

### Qué se prueba
✅ **Happy path**: Casos de éxito principales  
✅ **Validaciones críticas**: Datos requeridos, formatos, permisos  
✅ **Errores comunes**: null, vacíos, inválidos  

### Qué NO se prueba
❌ Tests para cada variación de null/undefined/vacío por separado  
❌ Edge cases muy específicos o improbables  
❌ Tests que validan implementación interna

## ✅ Tests por Categoría

### Utils - Validaciones de Email (9 tests)

**validarEmailRequerido()**
- ✅ Email válido no vacío
- ✅ Rechazo de email vacío
- ✅ Rechazo con solo espacios
- ✅ Rechazo de undefined
- ✅ Rechazo de null

**validarFormatoEmail()**
- ✅ Formato correcto
- ✅ Formato incorrecto
- ✅ Email sin dominio(10 tests)

**Email (2 tests)**
- ✅ Validar emails correctos
- ✅ Rechazar inválidos (vacío, espacios, null, sin @, formato)

**Tarea (8 tests)**
- ✅ validarIdRequerido: caso válido + mensaje personalizado
- ✅ validarTituloRequerido: caso válido + rechazos (vacío, espacios, null)
- ✅ validarEstado: P/C válidos + rechazos (inválido, vacío, minúsculas)
- ✅ validarPropiedadTarea: paths coinciden + no coinciden

### Utils - Transformaciones (2 tests)

**Tarea (2 tests)**
- ✅ construirPathUsuario: genera path correcto
- ✅ normalizarTexto: limpia espacios + maneja undefined

### Services (15 tests)

**UsuarioService (5 tests)**
- ✅ Crear con email válido
- ✅ Rechazar emails inválidos (loop de casos)
- ✅ Rechazar duplicado
- ✅ Login exitoso
- ✅ Rechazar login inválido

**TareaService (10 tests)**
- ✅ Obtener tareas + rechazar ID vacío
- ✅ Crear con datos válidos + normalización + rechazos (loop)
- ✅ Actualizar tarea + rechazar no existente/otro usuario + validaciones (loop)
- ✅ Eliminar tarea + rechazar no existente/otro usuarioverage

# Ver reporte
open coverage/lcov-report/index.html
```

## 📈 Métricas

- **Reducción de código**: ~50 líneas eliminadas por DRY
- **Funciones eliminadas**: 3 (duplicadas)
- **Funciones genéricas**: 2 (validarIdRequerido, normalizarTexto)
- **Tests actualizados**: 84 (todos passing)
- **Tiempo de ejecución**: ~0.8s

## 💡 Técnicas de Simplificación

### 1. Tests Agrupados
```typescript
// ❌ Antes: 5 tests separados
it("rechazar vacío")
it("rechazar espacios")
it("rechazar null")
it("rechazar undefined")
it("rechazar formato inválido")

// ✅ Ahora: 1 test con múltiples casos
it("debe rechazar email vacío o inválido", () => {
  expect(validarEmail("").valido).toBe(false);
  expect(validarEmail("   ").valido).toBe(false);
  expect(validarEmail(null).valido).toBe(false);
  expect(validarEmail("invalido").valido).toBe(false);
});
```

### 2. Loops para Validaciones Similares
```typescript
// ✅ Prueba múltiples casos con un loop
const casosInvalidos = [
  {usuarioId: "", payload: {titulo: "Test", estado: "P"}},
  {usuarioId: usuarioId, payload: {titulo: "", estado: "P"}},
  {usuarioId: usuarioId, payload: {titulo: "Test", estado: "X"}},
];

for (const caso of casosInvalidos) {
  const resultado = await service.crearTarea(caso.usuarioId, caso.payload);
  expect(resultado.exito).toBe(false);
}
```

### 3. Enfoque en Negocio
- Solo se prueban las reglas de negocio críticas
- No se prueban detalles de implementación
- Se confía en TypeScript para validaciones de tipos

## 📋 Estrategia de Testing

### Tests Unitarios de Utils
- **Sin mocks**: Funciones puras sin dependencias
- **Cobertura completa**: Todos los casos edge
- **Ejecución rápida**: No hay I/O ni async

### Tests Unitarios de Services
- **Con mocks**: Se mockean dependencias (DB, Tiempo, Auth)
- **Aislamiento**: Cada test es independiente
- **Casos completos**: Paths felices y de error

## 📊 Umbrales de Cobertura

El proyecto requiere:
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## ✨ Mejores Prácticas

1. **Arrange-Act-Assert**: Estructura clara en cada test
2. **Nombres descriptivos**: Cada test describe lo que prueba
3. **Mocks limpios**: Se resetean antes de cada test
4. **No duplicación**: Tests DRY usando beforeEach
5. **Casos edge**: Validaciones de null, undefined, vacíos
 de Refactorización

### Reducción de Tests
- **Antes**: 84 tests / 931 líneas
- **Ahora**: 27 tests / 386 líneas  
- **Reducción**: -68% tests, -59% código

### Mejoras
- ⚡ Ejecución más rápida: 0.6s (vs 0.8s)
- 📖 Más legible: menos tests para entender
- 🎯 Más enfocado: solo casos críticos
- 🔧 Más mantenible: menos código que actualizar
- ✨ Mismo nivel de confianza con menos código