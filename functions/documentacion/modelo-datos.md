# Modelo de Datos

## Firestore - Colecciones

### `usuarios`

```json
{
  "id": "Sc8brx613ZHW7wRKvgJ5",
  "correo": "usuario@ejemplo.com"  // único, requerido
}
```

### `tareas`
```json
{
  "id": "zUxIlHuigJMC8TB7laxf",
  "titulo": "Completar documentación",
  "descripcion": "Actualizar todos los archivos de documentación del proyecto",
  "estado": "P",
  "fecha_de_creacion": {
    "_seconds": 1704556800,
    "_nanoseconds": 0
  },
  "usuario": "/usuarios/Sc8brx613ZHW7wRKvgJ5"
}
```

#### Ruta del Documento
```
/tareas/{tareaId}
```

#### Estados Válidos
- **"P"**: Pendiente - La tarea está pendiente de completar
- **"C"**: Completada - La tarea ha sido completada

#### Validaciones
- **Título requerido**: No puede ser vacío o solo espacios
- **Estado válido**: Debe ser exactamente "P" o "C"
- **Usuario válido**: Debe ser una referencia válida a un documento en `/usuarios`
- **Fecha automática**: Se asigna automáticamente al crear la tarea

---

## Relaciones entre Colecciones

### Usuario → Tareas (Uno a Muchos)

```
usuarios/{userId}
    ↓ (referenciado por)
tareas/{tareaId}.usuario = "/usuarios/{userId}"
```

**Tipo de Relación**: Referencia por ruta (denormalización)

**Características**:
- Un usuario puede tener múltiples tareas
- Cada tarea pertenece a un único usuario
- La relación se establece mediante el campo `usuario` en la tarea
- Se almacena como string con la ruta completa del documento de usuario

**Ventajas**:
- No hay límite en el número de tareas por usuario
- Consultas eficientes por usuario
- Facilita la verificación de permisos

**Desventajas**:
- Si se elimina un usuario, las tareas quedan huérfanas (requiere limpieza manual)
- No hay integridad referencial automática

---

## Operaciones CRUD

### Usuarios

#### Crear Usuario
```typescript
POST /crearUsuario
Body: { correo: string }
```
- Valida formato de correo
- Verifica que el correo no exista
- Crea documento en `/usuarios`

#### Login Usuario
```typescript
POST /loginUsuario
Body: { correo: string }
```
- Busca usuario por correo
- Genera custom token de Firebase
- Retorna token y datos de usuario

### Tareas

#### Obtener Tareas por Usuario
```typescript
GET /obtenerTareasPorUsuario
Headers: { Authorization: "Bearer <token>" }
```
- Requiere autenticación
- Query: `where("usuario", "==", "/usuarios/{uid}")`
- Retorna array de tareas del usuario autenticado

#### Crear Tarea
```typescript
POST /crearTarea
Headers: { Authorization: "Bearer <token>" }
Body: { titulo: string, descripcion: string, estado: "P" | "C" }
```
- Requiere autenticación
- Asigna automáticamente:
  - `usuario`: Usuario autenticado
  - `fecha_de_creacion`: Timestamp actual
- Valida campos requeridos

#### Actualizar Tarea
```typescript
PUT /actualizarTarea
Headers: { Authorization: "Bearer <token>" }
Body: { tareaId: string, titulo?: string, descripcion?: string, estado?: "P" | "C" }
```
- Requiere autenticación
- Verifica propiedad (tarea.usuario === usuario autenticado)
- Actualiza solo campos proporcionados
- No modifica `fecha_de_creacion` ni `usuario`

#### Eliminar Tarea
```typescript
DELETE /eliminarTarea
Headers: { Authorization: "Bearer <token>" }
Body: { tareaId: string }
```
- Requiere autenticación
- Verifica propiedad antes de eliminar
- Eliminación física del documento

---

## Queries y Filtros

### Consultas Implementadas

#### Buscar Usuario por Correo
```typescript
usuarios
  .where("correo", "==", correo)
  .limit(1)
```

#### Obtener Tareas por Usuario
```typescript
tareas
  .where("usuario", "==", `/usuarios/${userId}`)
```

### Consideraciones de Seguridad

1. **Autenticación**:
   - Las operaciones de tareas requieren token JWT válido
   - El token se valida en Cloud Functions, no en reglas de Firestore

2. **Autorización**:
   - Solo el propietario puede modificar/eliminar sus tareas
   - Verificación a nivel de Service Layer

3. **Validación de Datos**:
   - Sanitización de strings (trim)
   - Validación de tipos y formatos
   - Verificación de estados válidos

---

## Tipos TypeScript

### Usuario
```typescript
interface Usuario {
  id: string;
  correo: string;
}

type CrearUsuario = Omit<Usuario, "id">;
```
Ubicación: [functions/src/types/usuario.types.ts](../src/types/usuario.types.ts)

### Tarea
```typescript
interface Tarea {
  id: string;
  titulo: string;
  descripcion: string;
  estado: "P" | "C";
  fecha_de_creacion: any; // Timestamp de Firestore
  usuario: string; // Ruta: /usuarios/{id}
}

type CrearTarea = Omit<Tarea, "id">;
type CrearTareaPayload = Pick<Tarea, "titulo" | "descripcion" | "estado">;
type ActualizarTareaPayload = Partial<Pick<Tarea, "titulo" | "descripcion" | "estado">>;
```
Ubicación: [functions/src/types/tarea.types.ts](../src/types/tarea.types.ts)

