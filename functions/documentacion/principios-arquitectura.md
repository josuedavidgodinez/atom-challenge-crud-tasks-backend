# Análisis de principios y arquitectura

## Estructura actual
- Entradas HTTP en Cloud Functions V2: `crearUsuario` y `obtenerUsuarioPorCorreo` expuestas en [functions/src/functions/usuario.functions.ts](functions/src/functions/usuario.functions.ts#L1-L94).
- Capa de aplicación/servicio: `UsuarioService` concentra reglas de negocio y validaciones en [functions/src/services/usuario.service.ts](functions/src/services/usuario.service.ts#L1-L113).
- Capa de infraestructura: `DatabaseFirestore` encapsula Firestore y se instancia como singleton en [functions/src/database/basededatos.firestore.ts](functions/src/database/basededatos.firestore.ts#L5-L134).
- Capa de acceso a datos (repository-like): `UsuarioModel` usa la abstracción de base de datos en [functions/src/models/usuario.model.ts](functions/src/models/usuario.model.ts#L1-L48).
- Tipos compartidos y contratos están en [functions/src/types](functions/src/types/index.ts).

## Aplicación de principios SOLID y diseño
- **Single Responsibility**: cada capa tiene responsabilidad clara (handler HTTP, servicio, modelo, conexión), evitando mezclar transporte, negocio e infraestructura.
- **Open/Closed**: el servicio usa el modelo mediante una interfaz (`BasedeDatos`), permitiendo extender almacenamiento sin tocar lógica del servicio.
- **Liskov / Interface Segregation**: `BasedeDatos` define un contrato pequeño y específico para operaciones CRUD, consumido por `UsuarioModel`.
- **Dependency Inversion**: `UsuarioModel` depende de la abstracción `BasedeDatos` en lugar de Firestore concreto, y recibe la implementación desde el servicio.
- **Patrones**:
  - **Singleton**: `DatabaseFirestore.obtenerInstancia()` asegura una sola conexión a Firestore ([functions/src/database/basededatos.firestore.ts#L25-L33](functions/src/database/basededatos.firestore.ts#L25-L33)).
  - **Repositorio**: `UsuarioModel` actúa como repositorio para la colección `usuarios` ([functions/src/models/usuario.model.ts#L7-L48](functions/src/models/usuario.model.ts#L7-L48)).
- **DRY / KISS / YAGNI**: código compacto y directo, sin duplicación innecesaria. Se evita complejidad extra (KISS) y solo se implementa lo requerido para usuarios (YAGNI)

## Uso de TypeScript
- Tipado explícito de modelos: `Usuario` y `CrearUsuario` en [functions/src/types/usuario.types.ts](functions/src/types/usuario.types.ts#L1-L12).
- Contrato de infraestructura: interfaz `BasedeDatos` con genéricos para CRUD en [functions/src/types/basededatos.types.ts](functions/src/types/basededatos.types.ts#L5-L18).
- Generics en operaciones de Firestore para devolver datos tipados en [functions/src/database/basededatos.firestore.ts#L57-L88](functions/src/database/basededatos.firestore.ts#L57-L88) y [functions/src/models/usuario.model.ts#L31-L42](functions/src/models/usuario.model.ts#L31-L42).
- Handlers y servicios tipan entradas/salidas (`CrearUsuario`, `Usuario`) en [functions/src/services/usuario.service.ts#L21-L110](functions/src/services/usuario.service.ts#L21-L110) y [functions/src/functions/usuario.functions.ts#L13-L94](functions/src/functions/usuario.functions.ts#L13-L94).

## Estructura de base de datos (Firestore)
- Colecciones raíz observadas:
  - `usuarios`: documentos con campos como `correo` (string). Ejemplo de documento referenciado en pantallas: `usuarios/Sc8brx613ZHW7wRKvgJ5`.
  - `tareas`: documentos con campos `titulo`, `descripcion`, `estado`, `fecha_de_creacion` (timestamp) y referencia al usuario en `usuario` (path a documento de `usuarios`). Ejemplo: `tareas/zUxIlHuigJMC8TB7laxf` con `usuario: /usuarios/aZW…`.
- Relaciones: las tareas referencian al usuario propietario mediante la ruta del documento, no hay subcolecciones anidadas en el snapshot provisto.
- Reglas actuales en código: el servicio trabaja sobre la colección `usuarios`; no hay lógica para `tareas` en el código fuente TypeScript.

