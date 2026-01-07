# Principios de Arquitectura

## Arquitectura General

El proyecto sigue los principios de **Clean Architecture** con separación clara de responsabilidades en capas:

### Capas de la Aplicación

```
┌─────────────────────────────────────────┐
│  Capa de Presentación (HTTP Handlers)  │  ← Cloud Functions V2
├─────────────────────────────────────────┤
│  Capa de Aplicación (Services)         │  ← Lógica de negocio
├─────────────────────────────────────────┤
│  Capa de Dominio (Models/Repositories) │  ← Acceso a datos
├─────────────────────────────────────────┤
│  Capa de Infraestructura (Adapters)    │  ← Integraciones externas
└─────────────────────────────────────────┘
```

### 1. Capa de Presentación (HTTP Handlers)
Punto de entrada de las peticiones HTTP mediante Cloud Functions V2:

- **Usuarios**: 
  - `crearUsuario` - [functions/src/functions/usuario.functions.ts](functions/src/functions/usuario.functions.ts)
  - `loginUsuario` - [functions/src/functions/usuario.functions.ts](functions/src/functions/usuario.functions.ts)
- **Tareas**: 
  - `obtenerTareasPorUsuario` - [functions/src/functions/tarea.functions.ts](functions/src/functions/tarea.functions.ts)
  - `crearTarea` - [functions/src/functions/tarea.functions.ts](functions/src/functions/tarea.functions.ts)
  - `actualizarTarea` - [functions/src/functions/tarea.functions.ts](functions/src/functions/tarea.functions.ts)
  - `eliminarTarea` - [functions/src/functions/tarea.functions.ts](functions/src/functions/tarea.functions.ts)

**Responsabilidad**: Validación de métodos HTTP, CORS, autenticación y orquestación de servicios.

### 2. Capa de Aplicación (Services)
Contiene la lógica de negocio y reglas de validación:

- `UsuarioService` - [functions/src/services/usuario.service.ts](functions/src/services/usuario.service.ts)
  - Validaciones de negocio (formato de correo, duplicados)
  - Autenticación mediante tokens personalizados
- `TareaService` - [functions/src/services/tarea.service.ts](functions/src/services/tarea.service.ts)
  - CRUD completo con validaciones
  - Verificación de permisos y propiedad
  - Reglas de estados válidos

**Responsabilidad**: Implementar casos de uso y reglas de negocio independientes de infraestructura.

### 3. Capa de Dominio (Models/Repositories)
Patrón Repository para acceso a datos:

- `UsuarioModel` - [functions/src/models/usuario.model.ts](functions/src/models/usuario.model.ts)
- `TareaModel` - [functions/src/models/tarea.model.ts](functions/src/models/tarea.model.ts)

**Responsabilidad**: Encapsular operaciones CRUD sobre las colecciones usando abstracciones.

### 4. Capa de Infraestructura (Adapters)
Implementaciones concretas de dependencias externas:

- `DatabaseFirestore` - [functions/src/database/basededatos.firestore.ts](functions/src/database/basededatos.firestore.ts)
  - Singleton que encapsula la conexión a Firestore
- `TiempoFirestore` - [functions/src/adapters/tiempo.firestore.ts](functions/src/adapters/tiempo.firestore.ts)
  - Adaptador para manejo de timestamps
- `AutenticacionFirebase` - [functions/src/adapters/autenticacion.firebase.ts](functions/src/adapters/autenticacion.firebase.ts)
  - Adaptador para generación de tokens personalizados
- `VerificadorTokenFirebase` - [functions/src/adapters/verificador-token.firebase.ts](functions/src/adapters/verificador-token.firebase.ts)
  - Adaptador para verificación de tokens JWT

**Responsabilidad**: Aislar dependencias de frameworks externos mediante interfaces.

### 5. Tipos y Contratos
Definiciones compartidas en [functions/src/types](functions/src/types/index.ts):

- `BasedeDatos` - Interfaz para operaciones CRUD
- `ITiempo` - Interfaz para timestamps
- `IAutenticacion` - Interfaz para generación de tokens
- `IVerificadorToken` - Interfaz para verificación de tokens
- `UsuarioDecodificado` - Tipo para información del usuario autenticado
- Modelos de dominio: `Usuario`, `Tarea`
- DTOs: `CrearUsuario`, `CrearTareaPayload`, `ActualizarTareaPayload`


## Principios SOLID

### Single Responsibility Principle (SRP)
Cada clase tiene una única responsabilidad:
- **Handlers**: Solo manejan HTTP (validaciones de método, CORS, orquestación)
- **Services**: Solo implementan lógica de negocio
- **Models**: Solo encapsulan acceso a datos
- **Adapters**: Solo implementan integraciones con servicios externos

### Open/Closed Principle (OCP)
El código está abierto a extensión, cerrado a modificación:
- Los servicios usan interfaces (`BasedeDatos`, `ITiempo`, `IAutenticacion`)
- Se pueden agregar nuevas implementaciones sin modificar servicios
- Ejemplo: Cambiar Firestore por PostgreSQL solo requiere un nuevo adaptador

### Liskov Substitution Principle (LSP)
Las implementaciones concretas son intercambiables:
- `DatabaseFirestore` implementa `BasedeDatos` completamente
- `TiempoFirestore` y `AutenticacionFirebase` cumplen sus contratos
- Cualquier implementación de las interfaces puede sustituir a otra

### Interface Segregation Principle (ISP)
Interfaces específicas y enfocadas:
- `BasedeDatos`: Solo operaciones CRUD necesarias
- `ITiempo`: Solo operación de timestamp actual
- `IAutenticacion`: Solo generación de tokens
- `IVerificadorToken`: Solo verificación de tokens
- No se fuerzan métodos innecesarios a los implementadores

Ejemplo de segregación correcta:
```typescript
// Separadas: generación vs verificación
interface IAutenticacion {
  crearTokenPersonalizado(uid: string, claims?: Record<string, unknown>): Promise<string>;
}

interface IVerificadorToken {
  verificarToken(token: string): Promise<UsuarioDecodificado>;
}
```
- `BasedeDatos`: Solo operaciones CRUD necesarias
- `ITiempo`: Solo operación de timestamp actual
- `IAutenticacion`: Solo generación de tokens
- No se fuerzan métodos innecesarios a los implementadores

### Dependency Inversion Principle (DIP)
Las dependencias apuntan hacia abstracciones:
- Services dependen de `ITiempo` e `IAutenticacion`, no de Firebase
- Models dependen de `BasedeDatos`, no de Firestore
- Las implementaciones concretas se inyectan en el punto de entrada
- **Inyección de Dependencias**: Constructor injection en todos los servicios

## Patrones de Diseño

### Singleton
`DatabaseFirestore` implementa el patrón Singleton:
```typescript
private static instancia: DatabaseFirestore | null = null;

static obtenerInstancia(): DatabaseFirestore {
  if (!DatabaseFirestore.instancia) {
    DatabaseFirestore.instancia = new DatabaseFirestore();
  }
  return DatabaseFirestore.instancia;
}
```
Ubicación: [functions/src/database/basededatos.firestore.ts](functions/src/database/basededatos.firestore.ts)

**Beneficio**: Una única conexión a Firestore en toda la aplicación.

### Repository Pattern
`UsuarioModel` y `TareaModel` actúan como repositorios:
- Encapsulan la lógica de acceso a datos
- Abstraen la implementación de la base de datos
- Proveen API simple para operaciones CRUD
- Ubicaciones:
  - [functions/src/models/usuario.model.ts](functions/src/models/usuario.model.ts)
  - [functions/src/models/tarea.model.ts](functions/src/models/tarea.model.ts)

### Adapter Pattern
Los adaptadores convierten interfaces externas en interfaces esperadas:
- `TiempoFirestore`: Adapta `Timestamp.now()` a `ITiempo`
- `AutenticacionFirebase`: Adapta `admin.auth().createCustomToken()` a `IAutenticacion`
- `VerificadorTokenFirebase`: Adapta `admin.auth().verifyIdToken()` a `IVerificadorToken`
- `DatabaseFirestore`: Adapta Firestore a `BasedeDatos`

**Ejemplo de Adaptador**:
```typescript
// Adaptador de verificación de tokens
export class VerificadorTokenFirebase implements IVerificadorToken {
  async verificarToken(token: string): Promise<UsuarioDecodificado> {
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      return {
        uid: decodedToken.uid,
        email: decodedToken.email,
      };
    } catch (error) {
      throw new Error("Token inválido o expirado");
    }
  }
}
```

**Beneficio**: Desacopla el código de negocio de las bibliotecas externas.

### Dependency Injection
Todas las dependencias se inyectan por constructor:
```typescript
// Composición en el punto de entrada
const db = DatabaseFirestore.obtenerInstancia();
const tiempo = new TiempoFirestore();
const autenticacion = new AutenticacionFirebase();

const tareaService = new TareaService(db, tiempo);
const usuarioService = new UsuarioService(db, autenticacion);
```

**Beneficio**: Código testeable y flexible.

## Principios de Desarrollo

### DRY (Don't Repeat Yourself)
- Código de validación reutilizable en middlewares
- Modelos genéricos para operaciones CRUD
- Tipos compartidos en `/types`

### KISS (Keep It Simple, Stupid)
- Funciones pequeñas y enfocadas
- Lógica directa sin complejidad innecesaria
- Nombres descriptivos y claros

### YAGNI (You Aren't Gonna Need It)
- Solo se implementa lo requerido
- No hay código especulativo
- Funcionalidad incremental según necesidad

## TypeScript y Tipado

### Tipado Fuerte
Todos los modelos y DTOs están tipados:

**Modelos de Dominio**:
- `Usuario` - [functions/src/types/usuario.types.ts](functions/src/types/usuario.types.ts)
- `Tarea` - [functions/src/types/tarea.types.ts](functions/src/types/tarea.types.ts)

**DTOs (Data Transfer Objects)**:
- `CrearUsuario`
- `CrearTareaPayload`
- `ActualizarTareaPayload`

**Interfaces de Infraestructura**:
- `BasedeDatos` - [functions/src/types/basededatos.types.ts](functions/src/types/basededatos.types.ts)
- `ITiempo` - [functions/src/types/tiempo.types.ts](functions/src/types/tiempo.types.ts)
- `IAutenticacion` - [functions/src/types/autenticacion.types.ts](functions/src/types/autenticacion.types.ts)

### Generics
Uso de genéricos para operaciones flexibles y type-safe:
```typescript
// En BasedeDatos
crear<T>(coleccion: string, datos: Omit<T, "id">): Promise<boolean>;
obtenerPorId<T>(coleccion: string, id: string): Promise<T | null>;
```

### Type Safety
- Validación en tiempo de compilación
- Autocompletado en IDE
- Detección temprana de errores
- Contratos claros entre capas

## Middleware y Cross-Cutting Concerns

### Validaciones de HTTP
Middleware genérico con Factory Pattern - [functions/src/middlewares/validarMetodo.ts](functions/src/middlewares/validarMetodo.ts):

```typescript
// Factory genérico (DRY)
export const crearValidadorMetodo = (metodoPermitido: MetodoHTTP) => {
  return (request, response) => {
    if (request.method !== metodoPermitido) {
      response.status(405).send({ /* ... */ });
      return false;
    }
    return true;
  };
};

// Middlewares pre-configurados
export const validarMetodoGet = crearValidadorMetodo("GET");
export const validarMetodoPost = crearValidadorMetodo("POST");
export const validarMetodoPut = crearValidadorMetodo("PUT");
export const validarMetodoDelete = crearValidadorMetodo("DELETE");
```

**Beneficios**:
- Elimina duplicación de código (DRY)
- Un solo lugar para modificar lógica
- Fácil agregar nuevos métodos (PATCH, OPTIONS, etc.)

### Validación de Contenido
- `validarJSON` - [functions/src/middlewares/validarJSON.ts](functions/src/middlewares/validarJSON.ts)
- Verifica Content-Type y parseo JSON para métodos con body

### Autenticación con Inyección de Dependencias

Middleware factory - [functions/src/middlewares/validarAutenticacion.ts](functions/src/middlewares/validarAutenticacion.ts):

```typescript
// Factory que recibe el verificador inyectado
export const crearMiddlewareAutenticacion = (verificador: IVerificadorToken) => {
  return async (request: RequestConUsuario, response: Response): Promise<boolean> => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        response.status(401).send({ /* ... */ });
        return false;
      }
      
      const idToken = authHeader.split("Bearer ")[1];
      const usuario = await verificador.verificarToken(idToken);
      request.usuario = usuario;
      return true;
    } catch (error) {
      response.status(401).send({ /* ... */ });
      return false;
    }
  };
};
```

**Composición en Cloud Functions**:
```typescript
// Inyección de dependencias en el punto de entrada
const verificadorToken = new VerificadorTokenFirebase();
const validarAutenticacion = crearMiddlewareAutenticacion(verificadorToken);
```

**Beneficios de la Nueva Arquitectura**:
- ✅ **Testeable**: Mockear `IVerificadorToken` fácilmente
- ✅ **Flexible**: Cambiar de Firebase a Auth0/JWT sin tocar middleware
- ✅ **SOLID**: Cumple Dependency Inversion completamente
- ✅ **Independiente**: No acoplado a Firebase en la capa de middleware

## Seguridad

### Autenticación
- **Método**: JWT (JSON Web Tokens) mediante Firebase Authentication
- **Arquitectura**: Middleware con Dependency Injection
- **Implementación**: Factory `crearMiddlewareAutenticacion(verificador: IVerificadorToken)`
- **Flujo**:
  1. Cliente envía `Authorization: Bearer <token>`
  2. Middleware extrae el token del header
  3. Verificador inyectado valida el token (Firebase, Auth0, JWT custom, etc.)
  4. Usuario decodificado se agrega al request
  5. Funciones acceden a `request.usuario.uid`

**Ventaja de la Arquitectura**:
- El middleware no conoce la implementación específica (Firebase)
- Fácil cambiar de proveedor de autenticación
- 100% testeable con mocks

### Autorización
Verificación de permisos a nivel de servicio:

**TareaService**:
- Método privado `validarPropiedadTarea()` verifica:
  - Existencia de la tarea
  - Propiedad del recurso (tarea.usuario === usuarioId)
- Usado en: `actualizarTarea()`, `eliminarTarea()`

**Principio**: Los usuarios solo pueden modificar sus propios recursos.

### Validaciones de Negocio

**Sanitización**:
- `.trim()` en todos los strings de entrada
- Validación de campos requeridos

**Reglas de Dominio**:
- Formato de correo electrónico (regex)
- Estados válidos de tareas: 'P' (Pendiente) o 'C' (Completada)
- Título obligatorio en tareas
- Verificación de duplicados (correo único)

### CORS
Configuración permisiva para desarrollo:
```typescript
const corsHandler = cors({origin: true});
```

**Producción**: Se recomienda configurar orígenes específicos.

## API y Funciones Expuestas

### Usuarios

#### `crearUsuario`
- **Método**: POST
- **Autenticación**: No requerida
- **Body**: `{correo: string}`
- **Validaciones**:
  - Correo requerido
  - Formato de correo válido
  - Correo no duplicado

#### `loginUsuario`
- **Método**: POST
- **Autenticación**: No requerida
- **Body**: `{correo: string}`
- **Respuesta**: `{token: string, usuario: Usuario}`
- **Token**: Custom token de Firebase para autenticación

### Tareas

#### `obtenerTareasPorUsuario`
- **Método**: GET
- **Autenticación**: Requerida (Bearer token)
- **Respuesta**: Array de tareas del usuario autenticado

#### `crearTarea`
- **Método**: POST
- **Autenticación**: Requerida
- **Body**: `{titulo: string, descripcion: string, estado: "P" | "C"}`
- **Validaciones**:
  - Título requerido y no vacío
  - Estado debe ser 'P' o 'C'
- **Comportamiento**:
  - Asigna automáticamente usuario autenticado
  - Asigna fecha de creación actual

#### `actualizarTarea`
- **Método**: PUT
- **Autenticación**: Requerida
- **Body**: `{tareaId: string, titulo?: string, descripcion?: string, estado?: "P" | "C"}`
- **Validaciones**:
  - Tarea debe existir
  - Usuario debe ser propietario
  - Al menos un campo para actualizar
  - Título no puede quedar vacío si se envía

#### `eliminarTarea`
- **Método**: DELETE
- **Autenticación**: Requerida
- **Body**: `{tareaId: string}`
- **Validaciones**:
  - Tarea debe existir
  - Usuario debe ser propietario

## Testabilidad

### Ventajas de la Arquitectura Actual

**Inyección de Dependencias**:
- Todas las dependencias se pueden mockear
- Services reciben interfaces, no implementaciones concretas

**Ejemplo de Test**:
```typescript
// Mock de ITiempo para testing
class TiempoMock implements ITiempo {
  ahora() {
    return new Date('2026-01-01');
  }
}

// Mock de IVerificadorToken para testing de autenticación
class VerificadorTokenMock implements IVerificadorToken {
  async verificarToken(token: string): Promise<UsuarioDecodificado> {
    if (token === 'token-valido') {
      return { uid: 'user123', email: 'test@example.com' };
    }
    throw new Error('Token inválido');
  }
}

// Test de TareaService
const dbMock = createMockDatabase();
const tiempoMock = new TiempoMock();
const tareaService = new TareaService(dbMock, tiempoMock);

// Test de Middleware de Autenticación
const verificadorMock = new VerificadorTokenMock();
const validarAuth = crearMiddlewareAutenticacion(verificadorMock);
```

**Capas Independientes**:
- Lógica de negocio sin dependencias de HTTP
- Models sin dependencias de framework
- Servicios testeables sin Cloud Functions

## Mejoras Futuras

### Sugerencias de Evolución

1. **Logging y Monitoreo**:
   - Implementar logger estructurado
   - Métricas de performance
   - Trazabilidad de requests

2. **Manejo de Errores**:
   - Clases de error personalizadas
   - Error boundary centralizado
   - Códigos de error consistentes

3. **Caché**:
   - Redis para datos frecuentes
   - Invalidación inteligente

4. **Paginación**:
   - Cursor-based pagination en listados
   - Límites configurables

5. **Validación Avanzada**:
   - Biblioteca como Zod o Joi
   - Esquemas declarativos
   - Mensajes de error más descriptivos

6. **Testing**:
   - Tests unitarios para Services
   - Tests de integración para Functions
   - Mocks de Firestore

7. **Documentación API**:
   - OpenAPI/Swagger
   - Postman collections
   - Ejemplos de uso

