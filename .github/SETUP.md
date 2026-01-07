# Configuración de GitHub Actions para Firebase

Este documento explica cómo configurar los workflows de CI/CD para desplegar automáticamente a Firebase Cloud Functions.

## 📋 Requisitos Previos

- Cuenta de GitHub con acceso al repositorio
- Proyecto de Firebase configurado
- Permisos para configurar secretos en GitHub

## 🔑 Configuración de Secretos

### 1. Obtener el Token de Firebase

Ejecuta el siguiente comando en tu terminal local:

```bash
firebase login:ci
```

Este comando te pedirá que inicies sesión en Firebase y luego generará un token. Copia el token que se muestra.

### 2. Agregar el Token a GitHub Secrets

1. Ve a tu repositorio en GitHub
2. Click en **Settings** > **Secrets and variables** > **Actions**
3. Click en **New repository secret**
4. Agrega los siguientes secretos:

#### Para Producción:
- **Name**: `FIREBASE_TOKEN`
- **Value**: El token obtenido del comando `firebase login:ci`


## 🚀 Workflows Disponibles

### 1. CI - Continuous Integration (`ci.yml`)

**Se ejecuta cuando:**
- Se hace push a la rama `main`

**Acciones que realiza:**
- ✅ Instala dependencias
- ✅ Ejecuta ESLint
- ✅ Compila TypeScript
- ✅ Verifica que el build sea exitoso

### 2. CD - Deploy to Production (`cd.yml`)

**Se ejecuta cuando:**
- Se hace push a la rama `main`
- Se ejecuta manualmente desde GitHub Actions

**Acciones que realiza:**
- 🚀 Compila el código
- 🚀 Despliega a Firebase Cloud Functions (producción)
- 🚀 Notifica el resultado del despliegue



**Acciones que realiza:**
- 🧪 Compila el código
- 🧪 Despliega a Firebase Cloud Functions (staging)
- 🧪 Notifica el resultado del despliegue

## 📝 Flujo de Trabajo Recomendado

### Desarrollo Normal

```bash
# 1. Crear una rama para nueva funcionalidad
git checkout -b feature/nueva-funcionalidad

# 2. Hacer cambios y commits
git add .
git commit -m "feat: agregar nueva funcionalidad"

# 3. Push a GitHub
git push origin feature/nueva-funcionalidad

# 4. Crear Pull Request hacia develop
# → El workflow de CI se ejecutará automáticamente

# 5. Después de aprobar el PR, hacer merge a develop
# → Se desplegará automáticamente a Staging

# 6. Cuando esté listo para producción, crear PR de develop a main
# → El workflow de CI se ejecutará

# 7. Hacer merge a main
# → Se desplegará automáticamente a Producción
```

### Deployment Manual

Si necesitas desplegar manualmente:

1. Ve a **Actions** en GitHub
2. Selecciona el workflow `CD - Deploy to Firebase` 
3. Click en **Run workflow**
4. Selecciona la rama
5. Click en **Run workflow**
