# Atom Challenge - CRUD Tasks Backend

Backend de gestión de tareas con Firebase Cloud Functions, Firestore y Authentication.

## 🚀 Stack

- Firebase Cloud Functions + Firestore + Auth
- TypeScript + Jest + ESLint
- CI/CD con GitHub Actions

## 🚀 Inicio Rápido

```bash
# Instalar
cd functions && npm install

# Configurar Firebase
firebase login
firebase use --add

# Desarrollo
npm run build
npm run serve  # Emuladores en localhost:4000

# Tests
npm run test:all
```

## 📡 API Endpoints

| Endpoint | Método | Auth |
|----------|--------|------|
| `/crearUsuario` | POST | No |
| `/loginUsuario` | POST | No |
| `/crearTarea` | POST | Sí |
| `/obtenerTareasPorUsuario` | GET | Sí |
| `/actualizarTarea` | PUT | Sí |
| `/eliminarTarea` | DELETE | Sí |

## 🧪 Testing

```bash
npm run test:unit          # Tests unitarios
npm run test:integration   # Tests con emuladores
npm run test:all          # Todos los tests
```

**Métricas:** 24+ tests integración | Coverage >= 70%

## 🚢 Deploy

```bash
npm run deploy  # Manual
```

Push a `main` → Deploy automático vía GitHub Actions

## 📚 Documentación

En `functions/documentacion/`:

- [configuracion.md](functions/documentacion/configuracion.md) - Setup completo
- [modelo-datos.md](functions/documentacion/modelo-datos.md) - Estructura BD
- [principios-arquitectura.md](functions/documentacion/principios-arquitectura.md) - Arquitectura
- [testing.md](functions/documentacion/testing.md) - Guía de tests
- [workflows.md](functions/documentacion/workflows.md) - CI/CD

## 🛠️ Scripts

```bash
npm run build              # Build
npm run serve              # Emuladores
npm run lint               # Lint
npm run test:all          # Tests
npm run deploy            # Deploy
```
