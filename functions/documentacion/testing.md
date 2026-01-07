# Testing

## Resumen

**Métricas:** 24+ tests integración | Coverage >= 70% | 100% endpoints

## Ejecución

```bash
npm run test:unit          # Tests unitarios
npm run test:integration   # Tests integración
npm run test:all          # Todos
npm run test:coverage:all # Coverage completo
```

## Estructura

```
tests/
├── integration/        # Tests de integración
│   ├── setup.ts       # Helpers
│   ├── usuario.*.ts   # 6 tests usuario
│   └── tarea.*.ts     # 18+ tests tareas
├── services/          # Tests unitarios
└── utils/             # Tests utilidades
```

## Endpoints Cubiertos

**Usuario (6 tests):** crear, login, validaciones, errores
**Tareas (18+ tests):** CRUD, auth, validaciones, aislamiento

## Helpers

- `initializeFirebaseForTests()` - Init Firebase
- `cleanupDatabase()` - Limpiar DB
- `createTestUser(email)` - Usuario test
- `generateCustomToken(uid)` - Token auth

## Troubleshooting

```bash
# Puertos en uso
lsof -i :5001 && kill -9 <PID>

# Verificar Java 17+
java -version
```

```bash
# macOS
brew install openjdk@17

# Ubuntu
sudo apt install openjdk-17-jdk
```

### Tests Fallan

```bash
cd functions
rm -rf node_modules package-lock.json
npm install
npm run build
npm run test:integration
```

## 📝 Mejores Prácticas

1. **Limpieza**: Cada test limpia datos antes de ejecutarse
2. **Aislamiento**: Tests independientes del orden
3. **AAA Pattern**: Arrange, Act, Assert
4. **Nombres descriptivos**: Indican claramente qué se testea
5. **Coverage**: Casos positivos y negativos
6. **Autenticación**: Tests con y sin tokens

## 🔄 Integración con CI/CD

Los tests se ejecutan automáticamente en GitHub Actions:

1. **Unit Tests**: En cada push/PR
2. **Integration Tests**: Con emuladores en CI
3. **Coverage**: Reportado automáticamente

Ver: `.github/workflows/ci.yml`
