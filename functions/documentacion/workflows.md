# CI/CD Workflows

## CI - Continuous Integration

**Trigger:** Push/PR a `main`

**Jobs:**
1. **lint-and-build** → ESLint + Build
2. **unit-tests** → Tests unitarios + Codecov
3. **integration-tests** → Tests con emuladores
4. **all-tests-passed** → Validación final

## CD - Deploy

**Trigger:** Push a `main` (automático) o manual

**Acción:** Build + Deploy a Firebase

## Setup de Secretos

```bash
# Generar token
firebase login:ci

# Agregar en GitHub Settings > Secrets
FIREBASE_TOKEN=<token-generado>
```

## Flujo de Trabajo

```bash
# Feature branch
git checkout -b feature/nueva-funcionalidad
git commit -m "feat: nueva funcionalidad"
git push origin feature/nueva-funcionalidad
# → CI ejecuta en PR

# Merge a main
# → CI + CD ejecutan automáticamente
```

## Troubleshooting

- **Tests fallan:** Verificar Java 17+ y cache emuladores
- **Deploy falla:** Verificar FIREBASE_TOKEN en secretos

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Firebase CLI](https://firebase.google.com/docs/cli)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
