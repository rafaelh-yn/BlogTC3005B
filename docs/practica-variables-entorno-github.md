# Práctica: Variables de entorno y subida a GitHub

En esta práctica vas a extraer todos los valores sensibles de tu proyecto a archivos `.env` y subir el código limpio a GitHub.

---

## Lista de pasos

- [ ] 1. Instalar `dotenv` en el servidor
- [ ] 2. Crear `server/.env` con las variables del servidor
- [ ] 3. Actualizar `server/server.js` para leer las variables con `process.env`
- [ ] 4. Crear `client/.env` con las variables del cliente
- [ ] 5. Actualizar los `fetch` del cliente para usar `import.meta.env.VITE_API_URL`
- [ ] 6. Verificar que `.env` está en el `.gitignore`
- [ ] 7. Crear los archivos `.env.example`
- [ ] 8. Verificar el proyecto en local antes de subir
- [ ] 9. Hacer commit y push a GitHub

---

## ¿Por qué hacemos esto?

Hasta ahora el servidor tiene valores como la contraseña de la base de datos escritos directamente en el código:

```js
password: 'blog_pass'
```

Si subes ese código a GitHub, **cualquier persona que vea tu repositorio puede ver esa contraseña**. Las variables de entorno resuelven esto: el código dice "lee la contraseña de aquí" pero el valor real solo existe en tu computadora (o en el servidor de producción), nunca en el repositorio.

---

## Paso 1 — Instalar `dotenv` en el servidor

`dotenv` es el paquete que lee el archivo `.env` y carga sus valores en `process.env`.

```bash
cd server
npm install dotenv
```

---

## Paso 2 — Crear `server/.env`

Crea el archivo `server/.env` con este contenido:

```
# Servidor
PORT=8000

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=blogdb
DB_USER=blog_user
DB_PASS=blog_pass

# Sesión
SESSION_SECRET=hola

# CORS
FRONTEND_URL=http://localhost:5173
```

> Este archivo **nunca se sube a GitHub**. Es solo para tu computadora.

---

## Paso 3 — Actualizar `server/server.js`

Agrega `require('dotenv').config()` al inicio del archivo, antes de usarlo:

```js
require('dotenv').config();
```

Luego reemplaza los valores hardcodeados:

**Antes:**
```js
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
```
**Después:**
```js
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
```

**Antes:**
```js
const cn = {
    host: 'localhost',
    port: 5432,
    database: 'blogdb',
    user: 'blog_user',
    password: 'blog_pass',
    allowExitOnIdle: true
}
```
**Después:**
```js
const cn = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    allowExitOnIdle: true
}
```

**Antes:**
```js
secret: 'hola',
cookie: { maxAge: 10 * 60 * 1000, secure: false },
```
**Después:**
```js
secret: process.env.SESSION_SECRET,
cookie: { maxAge: 10 * 60 * 1000, secure: process.env.NODE_ENV === 'production' },
```

**Antes:**
```js
app.listen(8000, () => {
    console.log('Servidor corriendo en el puerto 8000');
});
```
**Después:**
```js
app.listen(process.env.PORT, () => {
    console.log(`Servidor corriendo en el puerto ${process.env.PORT}`);
});
```

---

## Paso 4 — Crear `client/.env`

Crea el archivo `client/.env` con este contenido:

```
VITE_API_URL=http://localhost:8000
```

> En Vite, las variables de entorno que el navegador puede leer **deben empezar con `VITE_`**.

---

## Paso 5 — Actualizar los `fetch` del cliente

En todos los componentes que hacen `fetch`, reemplaza `http://localhost:8000` por `import.meta.env.VITE_API_URL`.

**Antes:**
```js
fetch('http://localhost:8000/posts')
```
**Después:**
```js
fetch(import.meta.env.VITE_API_URL + '/posts')
```

Archivos a modificar: `App.jsx`, `Blog.jsx`, `Post.jsx`, `Author.jsx`, `NewPost.jsx`, `Login.jsx`.

---

## Paso 6 — Verificar el `.gitignore`

Abre el `.gitignore` en la raíz del proyecto y confirma que esta línea existe:

```
.env
```

Esta línea hace que **todos** los archivos `.env` en cualquier carpeta del proyecto sean ignorados por git. Si no está, agrégala.

Puedes verificarlo corriendo:
```bash
git check-ignore -v server/.env
git check-ignore -v client/.env
```

Si el archivo está correctamente ignorado, cada comando te muestra en qué línea del `.gitignore` aplica la regla. Si no aparece nada, el archivo **no** está ignorado — revisa tu `.gitignore`.

---

## Paso 7 — Crear los archivos `.env.example`

Los `.env.example` son versiones del `.env` **sin valores reales** que sí se suben al repo. Sirven para que cualquier persona que clone el proyecto sepa qué variables necesita configurar.

Crea `server/.env.example`:
```
PORT=8000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=blogdb
DB_USER=blog_user
DB_PASS=blog_pass
SESSION_SECRET=cambia_esto_por_un_secreto_seguro
FRONTEND_URL=http://localhost:5173
```

Crea `client/.env.example`:
```
VITE_API_URL=http://localhost:8000
```

---

## Paso 8 — Verificar en local

Antes de subir, confirma que el proyecto sigue funcionando:

```bash
# Terminal 1
docker compose up db

# Terminal 2
cd server && npm run dev

# Terminal 3
cd client && npm run dev
```

Abre http://localhost:5173 y verifica que el blog carga los posts correctamente.

---

## Paso 9 — Commit y push a GitHub

Primero revisa qué archivos va a incluir git:

```bash
git status
```

Deberías ver algo así:
```
modified:   server/server.js
modified:   client/src/App.jsx
modified:   client/src/components/Blog.jsx
... (otros componentes)
new file:   server/.env.example
new file:   client/.env.example
```

Lo que **no** debe aparecer:
- `server/.env`
- `client/.env`
- `node_modules/`

Si aparecen, detente y revisa tu `.gitignore` antes de continuar.

Cuando todo se vea bien, haz el commit:

```bash
git add .
git commit -m "practica 8 - variables de entorno"
git push
```

---

## Verificación final

| ¿Qué debe estar en el repo? | ¿Qué NO debe estar? |
|---|---|
| `server/server.js` (sin valores hardcodeados) | `server/.env` |
| `server/.env.example` | `client/.env` |
| `client/.env.example` | `node_modules/` |
| Todos los componentes actualizados | `client/dist/` |
