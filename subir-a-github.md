# Subir el proyecto a GitHub

Esta guía asume que ya tienes tu proyecto funcionando en tu computadora y quieres subirlo a GitHub para luego desplegarlo en Render.

---

## 1. Verificar el `.gitignore`

Antes de hacer cualquier commit, asegúrate de que tu `.gitignore` en la raíz del proyecto tenga estas líneas:

```
# Dependencias
node_modules/

# Variables de entorno
.env

# Imágenes subidas por los usuarios
client/src/assets/uploads/*
!client/src/assets/uploads/.gitkeep

# Build de Vite
client/dist/

# Archivos del sistema operativo
.DS_Store
Thumbs.db
```

Lo más importante:
- **`node_modules/`** — nunca se sube, es muy pesado y se regenera con `npm install`
- **`client/src/assets/uploads/*`** — las imágenes que subiste durante las pruebas **no se deben subir al repo**
- **`!client/src/assets/uploads/.gitkeep`** — esta línea es la excepción: sí sube el archivo `.gitkeep` para que la carpeta exista en el repo (sin él, multer falla al arrancar)

> Si no tienes el archivo `.gitkeep`, créalo:
> ```bash
> touch client/src/assets/uploads/.gitkeep
> ```

---

## 2. Inicializar el repositorio y hacer el primer commit

```bash
git init
git add .
git commit -m "proyecto blog mascotas p7"
```

Verifica que no se hayan colado imágenes ni `node_modules`:
```bash
git status
```

---

## 3. Subir a GitHub

1. Crea un repositorio nuevo en [github.com](https://github.com) (sin README, sin `.gitignore` — ya los tienes)
2. Conecta tu repo local y sube:

```bash
git remote add origin https://github.com/tu-usuario/tu-repo.git
git branch -M main
git push -u origin main
```

---

## 4. El problema de las imágenes en Render

Cuando despliegas en Render, el servidor **no tiene las imágenes** que subiste desde tu laptop — están ignoradas en el `.gitignore` y nunca llegaron al repo. Esto es lo esperado.

### ¿Cómo manejar las imágenes seed?

Tienes dos opciones:

#### Opción A — Subir las imágenes de prueba como parte del repo (recomendada para este proyecto)

Si quieres que el blog se vea con contenido desde el primer momento, puedes incluir las imágenes de seed **directamente en el repo**, pero en una carpeta diferente a `uploads/`. La ruta `uploads/` está ignorada para que las fotos que suban los usuarios no contaminen el repo.

1. Crea una carpeta `client/src/assets/seed/` y pon ahí tus imágenes de prueba
2. En `db/init.sql`, usa esas rutas en los datos de prueba:

```sql
INSERT INTO post (title, text, img, date) VALUES
  ('Mi primer post', 'Texto del post...', '/src/assets/seed/foto1.jpg', '2024-01-01');
```

3. El campo `img` en la base de datos apunta a `/src/assets/seed/foto1.jpg` — Vite sirve los archivos de `src/assets/` normalmente

> **Nota:** Versionar imágenes en el repo funciona para datos de demostración con pocas fotos pequeñas. En un producto real no harías esto — los archivos binarios inflaman el historial de git y no escalan. Para manejar imágenes subidas por usuarios en producción existe servicios como Cloudinary. Ver [docs/temas-para-explorar.md](docs/temas-para-explorar.md).

#### Opción B — Re-subir las imágenes a mano después del deploy

Después de que Render levante tu app, entra a tu blog y crea los posts de nuevo usando el formulario de NewPost. Las imágenes se guardarán en el servidor de Render.

> **Ojo:** Render borra el sistema de archivos cada vez que haces redeploy. Las imágenes subidas por usuarios se pierden entre deploys. Para un producto real usarías un servicio externo como Cloudinary — ver [docs/temas-para-explorar.md](docs/temas-para-explorar.md).

---

## 5. Resumen rápido

| ¿Qué sube al repo? | ¿Qué NO sube? |
|---|---|
| Todo el código fuente | `node_modules/` |
| `db/init.sql` | `client/src/assets/uploads/*` (excepto `.gitkeep`) |
| `docker-compose.yml` | `.env` |
| `client/src/assets/seed/` (si usas Opción A) | `client/dist/` |
