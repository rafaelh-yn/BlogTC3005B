# Blog de Mascotas

Proyecto de referencia para TC3005B. Una aplicación de blog construida con React, Express y PostgreSQL.

---

## Requisitos previos

Antes de empezar, asegúrate de tener instalado lo siguiente:

| Herramienta | Versión | Cómo verificar |
|-------------|---------|----------------|
| Node.js | 20 LTS | `node --version` |
| npm | 10+ | `npm --version` |
| Docker Desktop | Cualquier versión reciente | `docker --version` |

> **Nota:** No necesitas instalar PostgreSQL. Docker lo maneja por ti.

---

## Cómo correr el proyecto

Necesitas **tres terminales** abiertas al mismo tiempo.

### Terminal 1 — Base de datos

```bash
docker compose up db
```

Espera a ver el mensaje `database system is ready to accept connections` antes de continuar.

> La primera vez que lo corras, Docker descarga la imagen de PostgreSQL y ejecuta `db/init.sql` automáticamente. Esto crea las tablas y agrega algunos posts de prueba.

### Terminal 2 — Servidor (Express)

```bash
cd server
npm install
npm run dev
```

Deberías ver: `Servidor corriendo en el puerto 8000`

### Terminal 3 — Cliente (React)

```bash
cd client
npm install
npm run dev
```

Deberías ver una URL como `http://localhost:5173` o `http://localhost:3000`.

---

## Estructura del proyecto

```
/
├── docker-compose.yml       ← Configura PostgreSQL en Docker
├── db/
│   └── init.sql             ← Crea las tablas e inserta datos de prueba
├── server/
│   ├── server.js            ← API en Express (puerto 8000)
│   └── package.json
└── client/
    └── src/
        ├── App.jsx           ← Rutas de la aplicación
        └── components/
            ├── Home.jsx
            ├── Blog.jsx      ← Lista de posts con buscador
            ├── Card.jsx      ← Tarjetas de posts
            ├── Post.jsx      ← Vista de un post individual
            ├── Author.jsx    ← Vista de un autor
            ├── NewPost.jsx   ← Formulario para crear posts
            └── Contact.jsx
```

---

## Solución de problemas

**El servidor no conecta con la base de datos**
Verifica que Docker esté corriendo y que hayas esperado a que la base de datos esté lista antes de iniciar el servidor.

**Error al subir una imagen**
Asegúrate de que la carpeta `client/src/assets/uploads/` exista. Si no está, créala:
```bash
mkdir -p client/src/assets/uploads
```

**Hice cambios en `db/init.sql` y quiero aplicarlos**

Docker solo corre `init.sql` la primera vez. Si modificas el archivo, necesitas borrar el volumen para que lo vuelva a ejecutar:

```bash
docker compose down -v
docker compose up db
```

> **Ojo:** `-v` borra todos los datos existentes. Úsalo solo en desarrollo cuando no te importe perderlos.
