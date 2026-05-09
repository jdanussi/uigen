# Configuración de GitHub MCP en Claude Code
### Curso: Claude Code in Action — Anthropic Skilljar
**Proyecto:** uigen | **Entorno:** Ubuntu + gh CLI + Claude Code

---

## Contexto

Este documento explica el flujo completo para conectar un proyecto local con GitHub
y habilitar el MCP de GitHub dentro de Claude Code. El curso asume ciertos pasos
como dados; acá están detallados.

**Carpeta de trabajo:**
```
/home/jdanussi/claude-code-course/dev/ui/uigen
```

---

## El flujo completo

```
uigen/ (carpeta sin git)
    ↓  PASO 1: git init + commit + rename branch a main
repo git local
    ↓  PASO 2: gh auth login
autenticación con GitHub
    ↓  PASO 3: gh repo create --push
repo publicado en GitHub
    ↓  PASO 4: claude mcp add github
MCP de GitHub activo en Claude Code
    ↓  PASO 5: Personal Access Token
Claude Code puede operar en tu repo
    ↓  PASO 6: GitHub Actions
CI/CD manejado desde Claude Code
```

---

## PASO 1 — Convertir la carpeta en un repo Git local

La carpeta `uigen` contiene el proyecto descargado del curso pero **no es un repositorio Git**.
Hay que inicializarlo antes de poder publicarlo en GitHub.

```bash
cd /home/jdanussi/claude-code-course/dev/ui/uigen

git init
git add .
git commit -m "Initial commit: uigen project from Anthropic course"
```

Renombrar el branch por defecto de `master` a `main`:
```bash
git branch -m master main
```

> **¿Por qué?** Git históricamente usaba `master` como nombre por defecto, pero
> la convención actual (y la que usa GitHub) es `main`. Renombrarlo antes del
> primer push evita inconsistencias entre el repo local y el remoto.

Verificar:
```bash
git log --oneline
# Debe mostrar el commit recién creado

git branch
# Debe mostrar: * main
```

---

## PASO 2 — Autenticarse en GitHub con gh CLI

`gh` es el CLI oficial de GitHub. Permite crear repos, abrir PRs y mucho más
directamente desde la terminal, sin necesidad de ir al navegador para cada acción.

```bash
gh auth login
```

El asistente interactivo pregunta:

| Pregunta | Respuesta |
|---|---|
| Where do you use GitHub? | `GitHub.com` |
| What is your preferred protocol? | `HTTPS` |
| Authenticate Git with your GitHub credentials? | `Y` |
| How would you like to authenticate? | `Login with a web browser` |

Se muestra un código de 8 caracteres → copiarlo → abrir el link que aparece →
pegarlo en el navegador → autorizar.

Verificar que quedó autenticado:
```bash
gh auth status
# Debe mostrar: Logged in to github.com as TU_USUARIO
```

---

## PASO 3 — Crear el repo en GitHub y hacer el primer push

Este único comando crea el repo en GitHub, lo conecta como `origin` y sube el código:

```bash
# Estando en /home/jdanussi/claude-code-course/dev/ui/uigen
gh repo create uigen --public --source=. --remote=origin --push
```

Opciones del comando:

| Flag | Descripción |
|---|---|
| `uigen` | Nombre del repo en GitHub |
| `--public` | Repo público (cambiar a `--private` si se prefiere) |
| `--source=.` | Usa la carpeta actual como fuente |
| `--remote=origin` | Nombra el remote como `origin` |
| `--push` | Hace el push automáticamente |

Verificar en el navegador:
```
https://github.com/TU_USUARIO/uigen
```

---

## PASO 4 — Instalar el MCP de GitHub en Claude Code

Con el repo ya en GitHub, instalar el servidor MCP que permite a Claude Code
interactuar con la API de GitHub:

```bash
claude mcp add github --scope user
```

El flag `--scope user` instala el MCP a nivel de usuario (disponible en todos
los proyectos), no solo en el proyecto actual.

Verificar que está instalado:
```bash
claude mcp list
# Debe aparecer "github" en la lista
```

---

## PASO 5 — Configurar el Personal Access Token (PAT)

El MCP necesita un token para actuar en nombre de tu cuenta de GitHub.

### Crear el token

1. Ir a: **https://github.com/settings/tokens**
2. Click en **"Generate new token (classic)"**
3. Darle un nombre descriptivo: `claude-code-mcp`
4. Seleccionar permisos:
   - `repo` (acceso completo a repos)
   - `workflow` (para GitHub Actions)
   - `read:org` (si trabajás en organizaciones)
5. Click en **"Generate token"**
6. **Copiar el token inmediatamente** (no se vuelve a mostrar)

### Configurar el token en Claude Code

Cuando Claude Code lo solicite al usar el MCP por primera vez, pegar el token.
También se puede configurar como variable de entorno:

```bash
export GITHUB_TOKEN=ghp_XXXXXXXXXXXXXXXXXXXX

# Para que persista, agregarlo al ~/.bashrc o ~/.zshrc:
echo 'export GITHUB_TOKEN=ghp_XXXXXXXXXXXXXXXXXXXX' >> ~/.bashrc
source ~/.bashrc
```

---

## PASO 6 — GitHub Actions

Una vez que el repo está en GitHub y el MCP configurado, Claude Code puede:

- Crear y editar workflows en `.github/workflows/`
- Leer el estado de los workflows
- Interpretar errores de CI/CD y proponer correcciones

### Ejemplo: crear un workflow básico desde Claude Code

Dentro de Claude Code, se puede pedir directamente:

```
Crea un workflow de GitHub Actions que ejecute los tests en cada push a main
```

Claude Code va a crear el archivo `.github/workflows/ci.yml` y commitearlo.

### Estructura típica de un workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        run: npm test  # o el comando que corresponda al proyecto
```

---

## Troubleshooting

### `gh: command not found`
```bash
sudo apt update && sudo apt install gh
```

### `git push` falla por autenticación
```bash
gh auth refresh
```

### El MCP de GitHub no aparece en Claude Code
```bash
claude mcp remove github
claude mcp add github --scope user
```

### El token expiró o no tiene permisos
Crear un nuevo token en https://github.com/settings/tokens y actualizar
la variable de entorno `GITHUB_TOKEN`.

---

## Referencias

- Curso oficial: https://anthropic.skilljar.com/claude-code-in-action/303240
- Documentación gh CLI: https://cli.github.com/manual/
- GitHub MCP Server: https://github.com/anthropics/github-mcp-server
- Personal Access Tokens: https://github.com/settings/tokens

---
*Documentado durante el curso Claude Code in Action — Mayo 2026*
