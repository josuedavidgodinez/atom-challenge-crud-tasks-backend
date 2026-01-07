# Arquitectura

## Clean Architecture - 4 Capas

```
Functions → Services → Models → Adapters
 (HTTP)    (Lógica)   (Datos)   (Firebase)
```

### 1. Functions (HTTP Handlers)
- `usuario.functions.ts` - crear, login
- `tarea.functions.ts` - CRUD tareas
- **Responsabilidad:** HTTP, CORS, auth

### 2. Services (Lógica de Negocio)
- `UsuarioService` - Validaciones, auth
- `TareaService` - CRUD, permisos
- **Responsabilidad:** Casos de uso

### 3. Models (Repositorios)
- `UsuarioModel` - CRUD usuarios
- `TareaModel` - CRUD tareas
- **Responsabilidad:** Acceso a datos

### 4. Adapters (Infraestructura)
- `DatabaseFirestore` - Singleton Firestore
- `TiempoFirestore` - Timestamps
- `AutenticacionFirebase` - Tokens
- **Responsabilidad:** Integración Firebase

## Principios SOLID

- **SRP:** Cada clase una responsabilidad
- **OCP:** Extensible vía interfaces
- **LSP:** Implementaciones intercambiables
- **ISP:** Interfaces específicas (`ITiempo`, `IAutenticacion`, `BasedeDatos`)
- **DIP:** Depende de abstracciones, no implementaciones

## Patrones

- **Singleton:** `DatabaseFirestore`
- **Repository:** `UsuarioModel`, `TareaModel`
- **Adapter:** Wrappers de Firebase
- **Dependency Injection:** Constructor injection
