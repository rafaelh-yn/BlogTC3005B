# Sesiones y login en producción (cross-origin)

Cuando corres el proyecto en local todo funciona porque el frontend (`localhost:5173`) y el backend (`localhost:8000`) comparten el mismo dominio. En producción, cada servicio tiene su propio dominio en Render — y ahí es donde el login puede dejar de funcionar aunque el backend responda correctamente.

Esta guía explica por qué pasa y qué tienes que cambiar en tu proyecto para que funcione.

---

## ¿Por qué falla el login en producción?

El login funciona con una **cookie de sesión**: cuando haces POST `/login`, el servidor crea una sesión y le manda al navegador una cookie con el ID de esa sesión. En cada petición siguiente, el navegador envía esa cookie para que el servidor sepa quién eres.

El problema es que los navegadores modernos bloquean las cookies entre dominios distintos por seguridad. Si tu frontend está en `mi-app-client.onrender.com` y tu backend en `mi-app-server.onrender.com`, el navegador considera que son dominios distintos y **descarta la cookie silenciosamente** — sin mostrar ningún error visible.

Para que funcione hay que cumplir cuatro condiciones al mismo tiempo:

| Dónde | Qué configurar |
|---|---|
| Backend — `server.js` | `app.set('trust proxy', 1)` |
| Backend — `server.js` | Cookie con `secure: true` y `sameSite: 'none'` en producción |
| Backend — `server.js` | CORS con `origin` exacto y `credentials: true` |
| Frontend — cada `fetch` | `credentials: 'include'` |

Si falta cualquiera de las cuatro, la cookie se descarta y el login no funciona.

---

## Cambios en el backend (`server.js`)

### 1. Trust proxy

Render pone un proxy reverso delante de tu servidor. Sin esta línea, Express no sabe que la conexión llega por HTTPS y no setea la cookie como `Secure`.

Agrégala **antes** de la configuración de sesión:

```js
app.set('trust proxy', 1);
```

### 2. Configuración de la cookie de sesión

La cookie necesita `secure: true` y `sameSite: 'none'` para viajar entre dominios distintos por HTTPS. En local no queremos esto porque no usamos HTTPS, así que lo condicionamos con `NODE_ENV`:

```js
app.use(session({
    // ... resto de la config
    cookie: {
        maxAge: 10 * 60 * 1000,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));
```

Asegúrate de tener `NODE_ENV=production` en las variables de entorno de Render.

### 3. CORS con credentials

El CORS debe apuntar exactamente a la URL de tu frontend (sin `/` al final) y tener `credentials: true`:

```js
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
```

`FRONTEND_URL` debe ser la URL real de tu frontend en Render, por ejemplo `https://mi-app-client.onrender.com`.

> **Importante:** `credentials: true` no funciona si `origin` es `'*'`. Debes poner la URL exacta.

---

## Cambios en el frontend

Cada `fetch` que necesite enviar o recibir la cookie de sesión debe incluir `credentials: 'include'`:

```js
// Login
fetch(import.meta.env.VITE_API_URL + '/login', {
    method: 'POST',
    credentials: 'include',
    body: formData,
})

// Rutas protegidas
fetch(import.meta.env.VITE_API_URL + '/autores/' + id, {
    credentials: 'include'
})
```

Sin `credentials: 'include'`, el navegador no envía la cookie aunque la tenga guardada.

---

## Variables de entorno necesarias

### Backend (Render → Web Service → Environment)

| Variable | Valor |
|---|---|
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | URL de tu frontend en Render (ej. `https://mi-app-client.onrender.com`) |
| `SESSION_SECRET` | Una cadena larga y aleatoria |

### Frontend (Render → Static Site → Environment)

| Variable | Valor |
|---|---|
| `VITE_API_URL` | URL de tu backend en Render (ej. `https://mi-app-server.onrender.com`) |

---

## Cómo verificar que funciona

1. Abre las DevTools del navegador (F12) → pestaña **Application** → **Cookies**
2. Después de hacer login, busca una cookie llamada `connect.sid` asociada al dominio de tu backend
3. Si la cookie aparece con los atributos `Secure` y `SameSite=None`, está bien configurada
4. Si no aparece ninguna cookie, revisa que todos los cambios de esta guía estén aplicados y que hayas hecho redeploy