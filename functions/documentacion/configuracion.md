# Configuración y Despliegue

## Requisitos

- Node.js 24.x + Firebase CLI + Java 21+
- Cuenta de Firebase

## Setup Local

```bash
# Instalar
cd functions && npm install

# Configurar Firebase
firebase login
firebase use --add

# Desarrollo
npm run build && npm run serve
```

## Emuladores

**Puertos:** Functions (5001) | Firestore (8080) | Auth (9099) | UI (4000)

```bash
firebase emulators:start
```

## Deploy

```bash
# Build
npm run build

# Deploy completo
firebase deploy

# Solo functions
firebase deploy --only functions
```

## Variables de Entorno

- **Local:** No requeridas (usa emuladores)
- **Producción:** Configurar en Firebase Console

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

El proyecto utiliza GitHub Actions para automatización:

**Workflows configurados:**

1. **CI (Continuous Integration)**
   - Lint y build
   - Tests unitarios
   - Tests de integración con emuladores
   - Coverage

2. **CD (Continuous Deployment)**
   - Deploy automático a producción

Ver documentación completa en [workflows.md](workflows.md)

### Configuración de Secretos

En GitHub Settings > Secrets:

```bash
# Obtener token
firebase login:ci

# Agregar en GitHub
FIREBASE_TOKEN=<token-generado>
```

---

## Testing

### Ejecutar Tests

```bash
cd functions

# Tests unitarios
npm run test:unit

# Tests de integración
npm run test:integration

# Todos los tests
npm run test:all

# Coverage
npm run test:coverage:all
```

Ver documentación completa en [testing.md](testing.md)

---

## Rollback

### Revertir Despliegue

Firebase mantiene versiones previas de las functions:

```bash
# Ver versiones
firebase functions:list

# No hay rollback automático, redesplegar versión anterior:
git checkout <commit-anterior>
npm run deploy
```

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
### Documentación Relacionada

- [Testing](testing.md) - Guía completa de tests
- [Workflows](workflows.md) - CI/CD con GitHub Actions
- [Modelo de Datos](modelo-datos.md) - Estructura de la base de datos
- [Arquitectura](principios-arquitectura.md) - Principios y patrones

# Limpiar build
rm -rf functions/lib
```

---

## Notas Adicionales

> Esta documentación está en proceso de construcción. Los apartados marcados como **PENDIENTE** serán completados próximamente.
