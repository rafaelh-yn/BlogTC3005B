# Despliegue en Render

Esta guía te lleva paso a paso para publicar el Blog de Mascotas en internet usando [Render](https://render.com). Al terminar tendrás tres servicios corriendo: la base de datos, el servidor y el cliente.

---

## Lista de pasos

- [ ] 1. Crear cuenta en Render
- [ ] 2. Crear la base de datos PostgreSQL
- [ ] 3. Ejecutar el script de inicialización (`init.sql`)
- [ ] 4. Crear el servicio del servidor (backend)
- [ ] 5. Configurar las variables de entorno del servidor
- [ ] 6. Crear el servicio del cliente (frontend)
- [ ] 7. Configurar las variables de entorno del cliente
- [ ] 8. Actualizar `FRONTEND_URL` en el servidor con la URL real del cliente
- [ ] 9. Verificar que todo funciona

---

## Paso 1 — Crear cuenta en Render

1. Ve a [render.com](https://render.com) y haz clic en **Get Started**.
2. Puedes registrarte con tu cuenta de GitHub — es la opción más cómoda porque Render podrá leer tus repositorios directamente.

---

## Paso 2 — Crear la base de datos PostgreSQL

1. En el dashboard de Render, haz clic en **New +** → **PostgreSQL**.
2. Llena los campos:
   - **Name:** `blogdb` (o el nombre que prefieras)
   - **Region:** la más cercana a ti (por ejemplo, Oregon US West)
   - **Plan:** Free
3. Haz clic en **Create Database**.
4. Espera a que el estado cambie a **Available** (puede tardar un minuto).
5. En la página de la base de datos, copia estos valores — los necesitarás más adelante:
   - **Host**
   - **Port**
   - **Database**
   - **Username**
   - **Password**

---

## Paso 3 — Ejecutar el script de inicialización

La base de datos está vacía. Necesitas crear las tablas y los datos de ejemplo.

1. En la página de tu base de datos en Render, busca la sección **Connections** y copia el **External Database URL**. Se ve así:
   ```
   postgresql://usuario:contraseña@host:5432/blogdb
   ```
2. Abre una terminal en tu computadora y ejecuta:
   ```bash
   psql postgresql://usuario:contraseña@host:5432/blogdb < db/init.sql
   ```
   > Si no tienes `psql` instalado, puedes usar [TablePlus](https://tableplus.com) o [DBeaver](https://dbeaver.io) para conectarte y ejecutar el archivo `init.sql` manualmente.

3. Verifica que se crearon las tablas `posts` y `authors`.

---

## Paso 4 — Crear el servicio del servidor (backend)

1. En el dashboard, haz clic en **New +** → **Web Service**.
2. Conecta tu repositorio de GitHub.
3. Configura el servicio:
   - **Name:** `blog-server` (o el nombre que prefieras)
   - **Root Directory:** `server`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free
4. **No hagas clic en Deploy todavía** — primero configura las variables de entorno en el siguiente paso.

---

## Paso 5 — Configurar las variables de entorno del servidor

En la misma página de creación del servicio, baja hasta la sección **Environment Variables** y agrega las siguientes:

| Variable | Valor |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `8000` |
| `DB_HOST` | El **Host** que copiaste en el Paso 2 |
| `DB_PORT` | `5432` |
| `DB_NAME` | El **Database** que copiaste en el Paso 2 |
| `DB_USER` | El **Username** que copiaste en el Paso 2 |
| `DB_PASS` | El **Password** que copiaste en el Paso 2 |
| `SESSION_SECRET` | Una cadena larga y aleatoria (ejemplo: `m1Bl0gS3cr3t0!`) |
| `FRONTEND_URL` | Por ahora pon `http://localhost:5173` — lo actualizarás en el Paso 8 |

Ahora sí haz clic en **Create Web Service**. Render instalará las dependencias y arrancará el servidor.

---

## Paso 6 — Crear el servicio del cliente (frontend)

1. En el dashboard, haz clic en **New +** → **Static Site**.
2. Conecta el mismo repositorio de GitHub.
3. Configura el servicio:
   - **Name:** `blog-client` (o el nombre que prefieras)
   - **Root Directory:** `client`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. **No hagas clic en Deploy todavía** — primero configura las variables de entorno.

---

## Paso 7 — Configurar las variables de entorno del cliente

En la sección **Environment Variables** del Static Site agrega:

| Variable | Valor |
|---|---|
| `VITE_API_URL` | La URL de tu servidor — la encuentras en la página del Web Service que creaste, termina en `.onrender.com` (ejemplo: `https://blog-server.onrender.com`) |

Ahora haz clic en **Create Static Site**. Render construirá el proyecto con `vite build`.

Una vez que termine, copia la URL del Static Site (también termina en `.onrender.com`).

---

## Paso 8 — Actualizar FRONTEND_URL en el servidor

Ahora que ya tienes la URL real del cliente, actualiza la variable de entorno del servidor:

1. Ve al Web Service (`blog-server`) en el dashboard.
2. Haz clic en **Environment** en el menú lateral.
3. Cambia el valor de `FRONTEND_URL` a la URL real del cliente (ejemplo: `https://blog-client.onrender.com`).
4. Haz clic en **Save Changes** — Render reiniciará el servidor automáticamente.

---

## Paso 9 — Verificar que todo funciona

1. Abre la URL del cliente en tu navegador.
2. Ve a la sección **Blog** — deberían aparecer los posts de ejemplo.
3. Intenta iniciar sesión.
4. Si algo falla, revisa los logs en el dashboard de Render:
   - **Web Service** → pestaña **Logs** para errores del servidor.
   - **Static Site** → pestaña **Events** para errores de build.

---

## Problemas comunes

| Problema | Causa probable | Solución |
|---|---|---|
| El frontend no se conecta al servidor | `VITE_API_URL` incorrecto | Verifica que apunte a la URL correcta del Web Service |
| Error 401 al iniciar sesión | `FRONTEND_URL` incorrecto en el servidor | Actualiza el valor con la URL real del cliente (Paso 8) |
| La base de datos no responde | Variables `DB_*` incorrectas | Copia los valores exactos desde la página de la base de datos en Render |
| Las imágenes no se guardan | Render no tiene disco persistente | Este tema se cubre en una práctica posterior con almacenamiento en la nube |
| El servidor tarda en responder | Plan gratuito de Render | En el plan Free, los servicios se "duermen" si no reciben tráfico por 15 minutos. La primera petición puede tardar ~30 segundos en despertar |

---

> **Nota sobre el plan gratuito:** Render Free tiene limitaciones — el servidor se suspende después de 15 minutos de inactividad y los datos de la base de datos se eliminan después de 90 días. Es suficiente para mostrar el proyecto, pero no para producción real.

---

## Nota — Rutas directas en el cliente (React Router + Static Site)

Si escribes una URL directamente en el navegador (por ejemplo `https://blog-client.onrender.com/login`) y obtienes un error 404, esto es normal en aplicaciones SPA (Single Page Application).

**¿Por qué pasa?** React Router maneja las rutas en el navegador con JavaScript. Cuando navegas desde la app, React intercepta el clic y cambia la vista sin hacer una petición al servidor — por eso funciona. Pero si escribes la URL directamente, el navegador hace una petición HTTP al servidor de Render pidiendo el archivo `/login`, que no existe. Render devuelve 404.

**La solución** es decirle a Render que sirva siempre `index.html` sin importar la ruta, para que React Router tome el control:

1. Ve a tu Static Site (`blog-client`) en el dashboard de Render.
2. Haz clic en **Settings** (o la pestaña **Redirects/Rewrites**).
3. Busca la sección **Rewrite Rules** y agrega una regla:
   - **Source:** `/*`
   - **Destination:** `/index.html`
   - **Action:** `Rewrite` (no `Redirect` — rewrite mantiene la URL original en el navegador)
4. Guarda y redespliega.

A partir de ese momento, Render servirá `index.html` para cualquier ruta y React Router se encargará del resto.
