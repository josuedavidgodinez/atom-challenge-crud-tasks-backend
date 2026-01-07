# Análisis de principios y arquitectura

## Estructura actual
- Entradas HTTP en Cloud Functions V2:
  - **Usuarios**: `crearUsuario` y `obtenerUsuarioPorCorreo` expuestas en [functions/src/functions/usuario.functions.ts](functions/src/functions/usuario.functions.ts#L1-L94).
  - **Tareas**: `obtenerTareasPorUsuario`, `crearTarea`, `actualizarTarea` y `eliminarTarea` expuestas en [functions/src/functions/tarea.functions.ts](functions/src/functions/tarea.functions.ts).
- Capa de aplicación/servicio:
  - `UsuarioService` concentra reglas de negocio y validaciones en [functions/src/services/usuario.service.ts](functions/src/services/usuario.service.ts#L1-L113).
  - `TareaService` maneja la lógica de negocio de tareas (CRUD completo) con validaciones de permisos y reglas de negocio en [functions/src/services/tarea.service.ts](functions/src/services/tarea.service.ts).
- Capa de infraestructura: `DatabaseFirestore` encapsula Firestore y se instancia como singleton en [functions/src/database/basededatos.firestore.ts](functions/src/database/basededatos.firestore.ts#L5-L134).
- Capa de acceso a datos (repository-like):
  - `UsuarioModel` usa la abstracción de base de datos en [functions/src/models/usuario.model.ts](functions/src/models/usuario.model.ts#L1-L48).
  - `TareaModel` encapsula operaciones CRUD de tareas en [functions/src/models/tarea.model.ts](functions/src/models/tarea.model.ts).
- Tipos compartidos y contratos están en [functions/src/types](functions/src/types/index.ts).

## Aplicación de principios SOLID y diseño
- **Single Responsibility**: cada capa tiene responsabilidad clara (handler HTTP, servicio, modelo, conexión), evitando mezclar transporte, negocio e infraestructura.
- **Open/Closed**: el servicio usa el modelo mediante una interfaz (`BasedeDatos`), permitiendo extender almacenamiento sin tocar lógica del servicio.
- **Liskov / Interface Segregation**: `BasedeDatos` define un contrato pequeño y específico para operaciones CRUD, consumido por `UsuarioModel` y `TareaModel`.
- **Dependency Inversion**: Los modelos (`UsuarioModel`, `TareaModel`) dependen de la abstracción `BasedeDatos` en lugar de Firestore concreto, y reciben la implementación desde el servicio.
- **Patrones**:
  - **Singleton**: `DatabaseFirestore.obtenerInstancia()` asegura una sola conexión a Firestore ([functions/src/database/basededatos.firestore.ts#L25-L33](functions/src/database/basededatos.firestore.ts#L25-L33)).
  - **Repositorio**: `UsuarioModel` y `TareaModel` actúan como repositorios para sus respectivas colecciones ([functions/src/models/usuario.model.ts#L7-L48](functions/src/models/usuario.model.ts#L7-L48), [functions/src/models/tarea.model.ts](functions/src/models/tarea.model.ts)).
- **DRY / KISS / YAGNI**: código compacto y directo, sin duplicación innecesaria. Se evita complejidad extra (KISS) y solo se implementa lo requerido (YAGNI).

## Uso de TypeScript
- Tipado explícito de modelos:
  - `Usuario` y `CrearUsuario` en [functions/src/types/usuario.types.ts](functions/src/types/usuario.types.ts#L1-L12).
  - `Tarea`, `CrearTarea`, `CrearTareaPayload` y `ActualizarTareaPayload` en [functions/src/types/tarea.types.ts](functions/src/types/tarea.types.ts).
- Contrato de infraestructura: interfaz `BasedeDatos` con genéricos para CRUD en [functions/src/types/basededatos.types.ts](functions/src/types/basededatos.types.ts#L5-L18).
- Generics en operaciones de Firestore para devolver datos tipados en [functions/src/database/basededatos.firestore.ts#L57-L88](functions/src/database/basededatos.firestore.ts#L57-L88) y modelos.
- Handlers y servicios tipan entradas/salidas usando tipos específicos para cada operación (crear, actualizar, etc.).

## Estructura de base de datos (Firestore)
- Colecciones raíz:
  - `usuarios`: documentos con campos como `correo` (string). Ejemplo de documento: `usuarios/Sc8brx613ZHW7wRKvgJ5`.
  - `tareas`: documentos con campos `titulo`, `descripcion`, `estado` (P/C), `fecha_de_creacion` (timestamp) y referencia al usuario en `usuario` (path a documento de `usuarios`). Ejemplo: `tareas/zUxIlHuigJMC8TB7laxf` con `usuario: /usuarios/aZW…`.
- Relaciones: las tareas referencian al usuario propietario mediante la ruta del documento, no hay subcolecciones anidadas.

## Funciones implementadas

### Usuarios
- **crearUsuario**: Crea un nuevo usuario en Firestore (POST).
- **loginUsuario**: Obtiene un usuario por correo (GET con query param).

### Tareas (CRUD completo)
- **obtenerTareasPorUsuario**: Obtiene todas las tareas de un usuario autenticado (GET con autenticación).
- **crearTarea**: Crea una nueva tarea para el usuario autenticado (POST con autenticación).
  - Validaciones: título requerido, estado debe ser 'P' o 'C'.
  - Asigna automáticamente el usuario y la fecha de creación.
- **actualizarTarea**: Actualiza una tarea existente (POST con autenticación).
  - Validaciones: verificación de propiedad (solo el dueño puede actualizar).
  - Campos opcionales: título, descripción, estado.
  - Protección: no permite actualizar tareas de otros usuarios.
- **eliminarTarea**: Elimina una tarea existente (POST con autenticación).
  - Validaciones: verificación de propiedad (solo el dueño puede eliminar).
  - Protección: no permite eliminar tareas de otros usuarios.

## Seguridad y validaciones
- **Autenticación**: Todas las operaciones de tareas requieren token JWT válido mediante middleware `validarAutenticacion`.
- **Autorización**: Las operaciones de actualización y eliminación verifican que la tarea pertenezca al usuario autenticado.
- **Validaciones de negocio**:
  - Campos requeridos (título, estado).
  - Estados válidos ('P' para Pendiente, 'C' para Completada).
  - Verificación de existencia de recursos antes de modificar/eliminar.
  - Sanitización de entradas (trim en strings).

