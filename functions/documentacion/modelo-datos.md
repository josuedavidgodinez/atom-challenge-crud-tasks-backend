# Modelo de Datos

## Base de Datos: Firestore

El proyecto utiliza **Cloud Firestore** como base de datos NoSQL orientada a documentos.

## Estructura de Colecciones

### Colección: `usuarios`

Almacena la información de los usuarios registrados en el sistema.

#### Esquema del Documento

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| `id` | string | ID autogenerado por Firestore | ✓ |
| `correo` | string | Correo electrónico único del usuario | ✓ |

#### Ejemplo de Documento
```json
{
  "id": "Sc8brx613ZHW7wRKvgJ5",
  "correo": "usuario@ejemplo.com"
}
```

#### Ruta del Documento
```
/usuarios/{userId}
```

#### Índices
- Campo `correo` indexado automáticamente para búsquedas

#### Validaciones
- **Correo único**: No pueden existir dos usuarios con el mismo correo
- **Formato de correo**: Debe cumplir con formato estándar de email (regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
- **Correo requerido**: No puede ser vacío o null

---

### Colección: `tareas`

Almacena las tareas creadas por los usuarios.

#### Esquema del Documento

| Campo | Tipo | Descripción | Requerido | Valores Permitidos |
|-------|------|-------------|-----------|-------------------|
| `id` | string | ID autogenerado por Firestore | ✓ | - |
| `titulo` | string | Título de la tarea | ✓ | No vacío |
| `descripcion` | string | Descripción detallada de la tarea | ✗ | Cualquier string |
| `estado` | string | Estado actual de la tarea | ✓ | "P" (Pendiente), "C" (Completada) |
| `fecha_de_creacion` | Timestamp | Fecha y hora de creación | ✓ | Timestamp de Firestore |
| `usuario` | string | Referencia al documento del usuario propietario | ✓ | Ruta: `/usuarios/{userId}` |

#### Ejemplo de Documento
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

### Índices Requeridos

Firestore crea automáticamente índices simples para cada campo. Para consultas compuestas futuras, se pueden definir en [firestore.indexes.json](../../firestore.indexes.json).

**Índices Actuales**:
- `usuarios.correo` (automático)
- `tareas.usuario` (automático)
- `tareas.estado` (automático)

---

## Reglas de Seguridad

Las reglas de seguridad de Firestore están definidas en [firestore.rules](../../firestore.rules).

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

---

## Migraciones y Evolución del Esquema

### Estrategia de Migraciones

Firestore es schema-less, pero se recomienda:

1. **Versionado de Documentos**:
   - Agregar campo `version` para rastrear cambios de esquema
   - Ejemplo: `version: 1`

2. **Migraciones Progresivas**:
   - Soportar múltiples versiones simultáneamente
   - Migrar datos bajo demanda (lazy migration)

3. **Campos Opcionales**:
   - Nuevos campos deben ser opcionales inicialmente
   - Validar existencia antes de usar

### Cambios Futuros Considerados

- **Usuarios**: 
  - Campo `nombre` (opcional)
  - Campo `fecha_registro` (Timestamp)
  - Campo `activo` (boolean)

- **Tareas**:
  - Campo `prioridad` ("alta" | "media" | "baja")
  - Campo `fecha_vencimiento` (Timestamp, opcional)
  - Campo `etiquetas` (array de strings)
  - Campo `fecha_completada` (Timestamp, opcional)

---

## Limitaciones de Firestore

### Límites a Considerar

- **Máximo de escrituras**: 10,000 escrituras/segundo por colección
- **Tamaño de documento**: 1 MB máximo
- **Profundidad de subcolecciones**: 100 niveles
- **Índices compuestos**: 200 por base de datos

### Optimizaciones Aplicadas

1. **Desnormalización**: Referencias por ruta en lugar de subcolecciones
2. **Índices simples**: Queries que usan índices automáticos
3. **Batch operations**: No implementado aún, considerar para operaciones masivas

---

## Backup y Recuperación

### Estrategia de Backup

Firebase proporciona backups automáticos (requiere configuración):
- Exportación programada a Cloud Storage
- Retención de 30 días
- Restauración point-in-time

### Recomendaciones

1. Habilitar exportaciones automáticas diarias
2. Almacenar exports en bucket separado
3. Probar proceso de restauración periódicamente
