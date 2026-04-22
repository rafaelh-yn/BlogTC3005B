/* Imports */
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const session = require('express-session')
const pgSession = require('connect-pg-simple')(session);
require('dotenv').config();

const app = express();

/* CORS config */
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());

// ── Conexión a la base de datos ───────────────────────────────
const pgp = require('pg-promise')();
const cn = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    allowExitOnIdle: true
}
const db = pgp(cn);

// ── Configuración de multer para subir imágenes ───────────────
const storage = multer.diskStorage({
    destination: '../client/src/assets/uploads/',
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

/* SESSION */
app.use(session({
    store: new pgSession({
        pgPromise: db, // DB object from pg-promise
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 10 * 60 * 1000, secure: process.env.NODE_ENV === 'production' },
}));

/* Function to authenticate */
const authenticateSession = (req, res, next) => {
    if (req.session.id_author) {
        next();
    } else {
        res.sendStatus(401);
    }
};

// ── Rutas ─────────────────────────────────────────────────────

/* GET todos los posts */
app.get('/posts', (req, res) => {
    db.any('SELECT posts.*, authors.name AS author_name FROM posts LEFT JOIN authors ON posts.author_id = authors.id_author ORDER BY date DESC')
    .then((data) => res.json(data))
    .catch((error) => console.log('ERROR:', error));
});

/* GET un post por id */
app.get('/posts/:id_post', (req, res) => {
    db.one('SELECT posts.*, authors.name AS author_name FROM posts LEFT JOIN authors ON posts.author_id = authors.id_author WHERE id_post = $1', [req.params.id_post])
    .then((data) => res.json(data))
    .catch((error) => console.log('ERROR:', error));
});

/* POST nuevo post */
app.post('/posts/new', upload.single('img'), (req, res) => {
    db.none(
        'INSERT INTO posts (title, text, img, date, author_id) VALUES($1, $2, $3, $4, $5)',
        [req.body.title, req.body.text, req.file ? req.file.originalname : null, req.body.date, req.body.author_id]
    )
    .then(() => res.json({ message: 'Post agregado correctamente' }))
    .catch((error) => console.log('ERROR:', error));
});

/* GET todos los autores */
app.get('/autores', (req, res) => {
    db.any('SELECT * FROM authors')
    .then((data) => res.json(data))
    .catch((error) => console.log('ERROR:', error));
});

/* GET un autor por id — requiere sesión activa */
app.get('/autores/:id_author', authenticateSession, (req, res) => {
    db.one('SELECT * FROM authors WHERE id_author = $1', [req.params.id_author])
    .then((data) => res.json(data))
    .catch((error) => console.log('ERROR:', error));
});

/* GET posts de un autor */
app.get('/autores/:id_author/posts', (req, res) => {
    db.any('SELECT * FROM posts WHERE author_id = $1 ORDER BY date DESC', [req.params.id_author])
    .then((data) => res.json(data))
    .catch((error) => console.log('ERROR:', error));
});

// GET session variables
app.get('/session-info', (req, res) => {
    res.json(req.session);
});

// GET to logout and end session
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Failed to destroy session');
        }
        res.send('Session destroyed');
    });
});

// POST login — verifica credenciales
app.post('/login', upload.none(), (req, res) => {
    const { username, password } = req.body;

    db.oneOrNone('SELECT * FROM authors WHERE username=$1', [username])
    .then((data) => {
        if (data != null) {
            // NOTA: en una aplicación real, la contraseña debería estar hasheada
            // (por ejemplo con bcrypt). Nunca guardes ni compares contraseñas en texto plano.
            if (data.password == password) {
                req.session.id_author = data.id_author;
                req.session.save(function (err) {
                    if (err) next(err)
                })
                res.send(req.session);
            } else {
                res.status(401).send('Invalid email/password');
            }
        } else {
            res.status(401).send('Invalid credentials');
        }
    })
    .catch((error) => console.log('ERROR: ', error));
});

// ── Inicio del servidor ───────────────────────────────────────
app.listen(process.env.PORT, () => {
    console.log(`Servidor corriendo en el puerto ${process.env.PORT}`);
});
