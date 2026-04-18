# Arquitectura del proyecto: Blog de Mascotas

> Este documento explica **qué** es cada pieza del sistema y **por qué** existe. No es un tutorial paso a paso — es el mapa conceptual que te ayuda a entender lo que estás construyendo antes de escribir la primera línea de código.

---

## De dónde venimos

Hasta ahora trabajaste con **HTML + CSS**: escribías un archivo `.html`, lo abrías en el navegador, y listo. Eso funciona perfectamente para páginas estáticas — páginas que siempre muestran lo mismo.

Pero imagina este problema: quieres que tu blog muestre los posts que hay en una base de datos, que los usuarios puedan crear posts nuevos, y que solo usuarios registrados puedan hacerlo. Con solo HTML no puedes hacer nada de eso. ¿Por qué?

- **HTML no tiene memoria.** Cada vez que abres o recargas la página, empieza desde cero.
- **HTML no puede conectarse a una base de datos.** No tiene acceso al disco del servidor ni a ningún sistema externo.
- **HTML no puede tener lógica de negocio.** No puede verificar si una contraseña es correcta, ni decidir qué datos mostrar según quién está viendo la página.

Para resolver esto necesitamos más piezas. El proyecto del blog usa cuatro: **React**, **Express**, **PostgreSQL** y **Docker**. Cada una resuelve un problema específico.

---

## La arquitectura: Cliente y Servidor

Lo primero que hay que entender es que la aplicación está dividida en dos mundos separados que se comunican por internet:

```
┌─────────────────────────────┐         ┌──────────────────────────────┐
│         CLIENTE             │         │           SERVIDOR            │
│                             │         │                              │
│   React (puerto 3000)       │◄───────►│   Express (puerto 8000)      │
│   Lo que ve el usuario      │  HTTP   │   La lógica del negocio      │
│   Corre en el navegador     │         │   Corre en Node.js           │
└─────────────────────────────┘         └──────────────┬───────────────┘
                                                       │
                                                       │
                                         ┌─────────────▼───────────────┐
                                         │       BASE DE DATOS          │
                                         │   PostgreSQL (puerto 5432)   │
                                         │   Guarda los datos           │
                                         │   Corre en Docker            │
                                         └─────────────────────────────┘
```

El **cliente** es lo que corre en el navegador del usuario. El **servidor** es un programa que corre en una computadora (o en la nube) y que el cliente le hace preguntas a través de la red. La **base de datos** guarda la información de forma persistente, y solo el servidor habla directamente con ella.

> **Analogía:** Es como una cafetería. El cliente (tú) le pide algo al mesero (Express). El mesero va a la cocina (PostgreSQL), trae lo que pediste, y te lo entrega. Tú nunca entras a la cocina.

---

## Las cuatro piezas

### 1. React — el cliente

**¿Qué es?**
React es una librería de JavaScript que te permite construir interfaces de usuario a partir de **componentes** — piezas reutilizables de UI que tienen su propio estado y lógica.

**¿Por qué no usar HTML directamente?**
HTML es estático. Si quieres actualizar algo en pantalla sin recargar la página — por ejemplo, filtrar los posts del blog mientras el usuario escribe en el buscador — necesitas JavaScript. React organiza ese JavaScript de una forma que es mucho más manejable que escribirlo a mano.

**El concepto clave: estado (`useState`)**
En HTML, lo que se muestra en pantalla es fijo. En React, lo que se muestra depende del **estado**: variables que, cuando cambian, hacen que React actualice automáticamente la pantalla. Por ejemplo, el texto que el usuario escribe en el buscador es estado — cuando cambia, la lista de posts se filtra sola.

```
Estado cambia  →  React re-renderiza  →  El usuario ve el cambio
```

**¿Cómo habla React con el servidor?**
Usando `fetch()` — una función de JavaScript que hace peticiones HTTP. Es exactamente lo que hace tu navegador cuando visita una página web, pero desde el código.

```js
// "Oye servidor, dame todos los posts"
fetch('http://localhost:8000/posts')
  .then(res => res.json())
  .then(data => setPosts(data));
```

---

### 2. Express — el servidor

**¿Qué es?**
Express es un framework de Node.js (Node.js es JavaScript que corre fuera del navegador, en el servidor) que permite crear una **API**: un conjunto de rutas (URLs) que el cliente puede llamar para pedir o enviar datos.

**¿Por qué necesitamos un servidor?**
Tres razones principales:

1. **Acceso a la base de datos.** Solo el servidor puede hablar con PostgreSQL. Si el cliente pudiera hacerlo directamente, cualquier usuario podría ver o modificar todos los datos de todos.
2. **Lógica de negocio protegida.** Las reglas importantes (¿está el usuario autenticado?, ¿tiene permiso?) viven en el servidor. El usuario no puede modificarlas.
3. **Manejo de archivos.** Guardar imágenes en el disco del servidor requiere acceso al sistema de archivos — algo que el navegador no puede hacer por razones de seguridad.

**¿Cómo funciona?**
Express define **endpoints** — rutas con un método HTTP y una función que se ejecuta cuando alguien llama a esa ruta:

```js
// GET /posts → devuelve todos los posts
app.get('/posts', function(req, res) {
  db.any("SELECT * FROM post")
    .then(posts => res.json(posts));
});

// POST /posts/new → crea un post nuevo
app.post('/posts/new', function(req, res) {
  db.none("INSERT INTO post (title) VALUES($1)", [req.body.title])
    .then(() => res.json({ message: 'Creado' }));
});
```

**Métodos HTTP — el vocabulario de la comunicación:**

| Método | Significado            | Ejemplo                   |
|--------|------------------------|---------------------------|
| GET    | Dame información       | Obtener todos los posts   |
| POST   | Recibe esta información| Crear un post nuevo       |
| PUT    | Actualiza esto         | Editar un post existente  |
| DELETE | Borra esto             | Eliminar un post          |

---

### 3. PostgreSQL — la base de datos

**¿Qué es?**
PostgreSQL (o "Postgres") es un sistema de base de datos relacional. Guarda datos en **tablas** (como hojas de cálculo), y permite hacer consultas con SQL para obtener exactamente lo que necesitas.

**¿Por qué necesitamos una base de datos y no simplemente un archivo?**
Porque los archivos no escalan. Imagina 10,000 posts guardados en un archivo de texto — ¿cómo buscas el post con cierto título? ¿Cómo lo actualizas sin corromper el archivo? Una base de datos resuelve todo esto con décadas de optimización detrás.

**¿Por qué persiste los datos?**
Porque vive en el disco, no en la memoria. Cuando cierras el servidor de Express, los datos en la base de datos no desaparecen. La próxima vez que el servidor arranca, los datos siguen ahí.

**Las tablas del proyecto:**

```sql
-- Los posts del blog
CREATE TABLE post (
  id     SERIAL PRIMARY KEY,
  title  TEXT,
  text   TEXT,
  img    TEXT,    -- nombre del archivo de imagen (no la imagen en sí)
  date   DATE
);

-- Los autores (usuarios)
CREATE TABLE autor (
  id        SERIAL PRIMARY KEY,
  name      TEXT,
  username  TEXT,
  password  TEXT
);

-- Las sesiones activas (la maneja express-session automáticamente)
CREATE TABLE session (
  sid     VARCHAR PRIMARY KEY,
  sess    JSON NOT NULL,
  expire  TIMESTAMP NOT NULL
);
```

> **Nota:** Las imágenes no se guardan en la base de datos — eso sería muy ineficiente. Solo se guarda el **nombre del archivo**. La imagen en sí vive en el disco del servidor, en la carpeta `client/src/assets/uploads/`.

---

### 4. Docker — el entorno controlado

**¿Qué es?**
Docker es una herramienta que permite empaquetar un programa junto con todo lo que necesita para correr (sistema operativo, dependencias, configuración) en un **contenedor** — una caja aislada que funciona igual en cualquier computadora.

**¿Por qué usamos Docker para la base de datos?**
Porque instalar PostgreSQL directamente en tu computadora puede ser complicado, y cada sistema operativo (Windows, macOS, Linux) lo hace diferente. Con Docker, la instalación es siempre:

```bash
docker compose up db
```

Y listo. No importa tu sistema operativo, no importa si ya tenías otra versión de Postgres instalada, no hay conflictos.

**¿Qué es `docker-compose.yml`?**
Es el archivo de configuración que le dice a Docker qué contenedores levantar y cómo configurarlos. Piénsalo como la receta del entorno de desarrollo.

```
Tu proyecto
├── docker-compose.yml   ← "levanta Postgres en el puerto 5432 con esta contraseña"
├── client/              ← React (corre con: npm run dev)
└── server/              ← Express (corre con: node server.js)
```

> Docker corre la **base de datos**. React y Express los corres tú directamente en tu terminal con `npm`.

---

## ¿Cómo se comunican todas las piezas?

### El flujo de una petición GET (leer posts)

```
1. Usuario abre el blog en el navegador
2. React hace: fetch('http://localhost:8000/posts')
3. Express recibe la petición en app.get('/posts', ...)
4. Express hace: SELECT * FROM post (consulta a Postgres)
5. Postgres devuelve los datos a Express
6. Express responde con JSON: [{id:1, title:"Primer post"}, ...]
7. React recibe el JSON y actualiza el estado
8. React re-renderiza y el usuario ve los posts en pantalla
```

### El flujo de una petición POST (crear un post con imagen)

```
1. Usuario llena el formulario y hace click en "Crear Post"
2. React empaqueta los datos en un FormData (título + archivo de imagen)
3. React hace: fetch('http://localhost:8000/posts/new', { method: 'POST', body: formData })
4. Express recibe la petición
5. multer intercepta primero: guarda la imagen en /client/src/assets/uploads/
6. Express ejecuta: INSERT INTO post (title, img) VALUES(...)
7. Postgres guarda el registro
8. Express responde: { message: 'Post agregado correctamente' }
9. React recibe la respuesta y puede actualizar la lista de posts
```

---

## Conceptos importantes

### Puertos
Un **puerto** es como una puerta numerada en tu computadora. Cuando un programa "escucha" en un puerto, está esperando peticiones que lleguen por esa puerta.

- `localhost:3000` → React (tu frontend)
- `localhost:8000` → Express (tu API)
- `localhost:5432` → PostgreSQL (tu base de datos)

Cuando React hace `fetch('http://localhost:8000/posts')`, está tocando la puerta 8000 — donde está escuchando Express.

### CORS
Por defecto, los navegadores bloquean que una página en `localhost:3000` haga peticiones a `localhost:8000`. Esto es una medida de seguridad llamada **Same-Origin Policy**. Para permitirlo, el servidor Express necesita indicar explícitamente que acepta peticiones de ese origen — eso se configura con el middleware `cors`.

### Variables de entorno (`.env`)
Las contraseñas, las credenciales de la base de datos, y otras configuraciones sensibles **no deben estar escritas directamente en el código** — porque si subes tu código a GitHub, todo el mundo las vería. En su lugar, se guardan en un archivo `.env` que nunca se sube al repositorio.

```
# server/.env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=blogdb
DB_USER=blog_user
DB_PASSWORD=blog_pass
SESSION_SECRET=una-cadena-secreta-muy-larga
```

### multer — ¿por qué necesitamos un middleware para archivos?
Express sabe leer JSON y texto en el cuerpo de una petición. Pero las imágenes no son texto — son datos binarios que llegan con un formato especial llamado `multipart/form-data`. `multer` es el middleware que sabe leer ese formato, guardar el archivo en el disco, y poner la información del archivo en `req.file` para que puedas usarla.

### express-session — ¿cómo sabe el servidor quién eres?
HTTP es un protocolo **sin memoria**: cada petición es independiente. El servidor no recuerda que ya te autenticaste hace dos segundos. Las sesiones resuelven esto: cuando haces login, el servidor guarda un registro en la base de datos y te da una **cookie** con un ID. En cada petición siguiente, el navegador manda esa cookie automáticamente, y el servidor la usa para saber quién eres.

```
Login:
  Cliente → POST /login (usuario + contraseña)
  Servidor → verifica, crea sesión en BD, envía cookie con session ID

Petición protegida:
  Cliente → GET /autor/1 (con la cookie automáticamente)
  Servidor → lee la cookie, busca la sesión en BD, verifica que esté autenticado
  Servidor → responde con los datos (o con 401 Unauthorized si no hay sesión)
```

---

## Estructura del proyecto

```
blog-mascotas/
│
├── docker-compose.yml       ← Configura PostgreSQL en Docker
│
├── db/
│   └── init.sql             ← Crea las tablas al iniciar Docker
│
├── server/                  ← El backend (Express)
│   ├── server.js            ← Punto de entrada del servidor
│   ├── package.json         ← Dependencias del servidor
│   └── .env                 ← Variables de entorno (NO subir a git)
│
└── client/                  ← El frontend (React + Vite)
    ├── src/
    │   ├── App.jsx           ← Componente raíz, define las rutas
    │   ├── components/       ← Componentes individuales
    │   │   ├── Blog.jsx
    │   │   ├── NewPost.jsx
    │   │   ├── Login.jsx
    │   │   └── Author.jsx
    │   └── assets/
    │       └── uploads/      ← Imágenes subidas por los usuarios
    ├── package.json
    └── vite.config.js
```

---

## Resumen rápido

| Pieza       | Corre en            | Habla con       | Su trabajo                              |
|-------------|---------------------|-----------------|-----------------------------------------|
| React       | Navegador (3000)    | Express         | Mostrar la UI, manejar interacciones    |
| Express     | Node.js (8000)      | React + Postgres| API, lógica de negocio, autenticación  |
| PostgreSQL  | Docker (5432)       | Express         | Guardar y devolver datos               |
| Docker      | Tu computadora      | —               | Empaquetar y correr Postgres            |
| multer      | Dentro de Express   | Sistema de archivos | Recibir y guardar imágenes          |
| express-session | Dentro de Express | Postgres     | Recordar qué usuarios están autenticados|

---

> **Para recordar:** Cada vez que algo no funciona, pregúntate: ¿en qué capa está el problema? ¿Es algo de React (UI)? ¿Del fetch (comunicación)? ¿Del endpoint en Express (servidor)? ¿De la consulta SQL (base de datos)? Separar el problema en capas es la forma de debuggear sistemas como este.
