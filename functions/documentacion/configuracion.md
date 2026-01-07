# Guía de Configuración y Despliegue

## Requisitos Previos

### Software Necesario

- Node.js (versión recomendada: 18.x o superior)
- npm (viene con Node.js)
- Firebase CLI
- Git

### Cuentas Requeridas

- Cuenta de Google/Firebase
- Proyecto de Firebase creado

---

## Configuración del Entorno Local

### 1. Clonar el Repositorio

```bash
# Clonar el proyecto
git clone <repository-url>
cd atom-challenge-crud-tasks-backend
```

### 2. Instalación de Dependencias

```bash
# Instalar dependencias raíz
npm install

# Instalar dependencias de functions
cd functions
npm install
```

### 3. Configuración de Firebase

```bash
# Instalar Firebase CLI globalmente (si no está instalado)
npm install -g firebase-tools

# Autenticarse con Firebase
firebase login

# Inicializar el proyecto (si es necesario)
firebase init
```

### 4. Variables de Entorno

> **PENDIENTE**: Documentar variables de entorno necesarias

---

## Estructura de Configuración

### Archivos de Configuración

#### `firebase.json`
> **PENDIENTE**: Documentar configuración de Firebase

#### `firestore.rules`
> **PENDIENTE**: Documentar reglas de seguridad de Firestore

#### `firestore.indexes.json`
> **PENDIENTE**: Documentar índices de Firestore

#### `functions/tsconfig.json`
> **PENDIENTE**: Documentar configuración de TypeScript

---

## Desarrollo Local

### Emuladores de Firebase

```bash
# Iniciar emuladores
firebase emulators:start
```

> **PENDIENTE**: Documentar configuración de emuladores y puertos

### Compilación de TypeScript

```bash
# Desde el directorio functions
npm run build
```

### Modo de Desarrollo

> **PENDIENTE**: Documentar scripts de desarrollo y hot-reload

---

## Testing

### Configuración de Tests

> **PENDIENTE**: Documentar framework de testing y configuración

### Ejecutar Tests

```bash
# Tests unitarios
npm test

# Tests con coverage
npm run test:coverage
```

---

## Despliegue a Producción

### 1. Preparación

> **PENDIENTE**: Documentar checklist pre-despliegue

### 2. Build de Producción

```bash
# Compilar TypeScript
cd functions
npm run build
```

### 3. Desplegar Functions

```bash
# Desplegar todas las functions
firebase deploy --only functions

# Desplegar function específica
firebase deploy --only functions:crearUsuario
```

### 4. Desplegar Reglas de Firestore

```bash
firebase deploy --only firestore:rules
```

### 5. Desplegar Índices

```bash
firebase deploy --only firestore:indexes
```

---

## Configuración de Seguridad

### Reglas de Firestore

> **PENDIENTE**: Documentar configuración de reglas de seguridad

### Autenticación

> **PENDIENTE**: Documentar configuración de Firebase Authentication

### CORS

> **PENDIENTE**: Documentar configuración de CORS para producción

---

## Monitoreo y Logs

### Firebase Console

> **PENDIENTE**: Documentar cómo acceder a logs y métricas

### Logging

> **PENDIENTE**: Documentar estrategia de logging

---

## Troubleshooting

### Problemas Comunes

> **PENDIENTE**: Documentar problemas comunes y soluciones

---

## Comandos Útiles

```bash
# Ver logs en tiempo real
firebase functions:log

# Ver estado de despliegue
firebase deploy:status

# Eliminar functions no utilizadas
firebase functions:delete functionName

# Listar projects
firebase projects:list

# Cambiar de project
firebase use <project-id>
```

---

## Ambiente de Staging

> **PENDIENTE**: Documentar configuración de ambiente de staging

---

## CI/CD

### GitHub Actions

> **PENDIENTE**: Documentar pipeline de CI/CD

### Despliegue Automático

> **PENDIENTE**: Documentar configuración de despliegue automático

---

## Rollback

### Revertir Despliegue

> **PENDIENTE**: Documentar proceso de rollback

---

## Mantenimiento

### Actualización de Dependencias

```bash
# Verificar dependencias desactualizadas
npm outdated

# Actualizar dependencias
npm update
```

### Limpieza

```bash
# Limpiar node_modules
rm -rf node_modules
npm install

# Limpiar build
rm -rf functions/lib
```

---

## Notas Adicionales

> Esta documentación está en proceso de construcción. Los apartados marcados como **PENDIENTE** serán completados próximamente.
