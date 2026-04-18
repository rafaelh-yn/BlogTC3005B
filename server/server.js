const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json());

// ── Conexión a la base de datos ───────────────────────────────
const pgp = require('pg-promise')();
const cn = {
    host: 'localhost',
    port: 5432,
    database: 'blogdb',
    user: 'blog_user',
    password: 'blog_pass',
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

// ── Rutas ─────────────────────────────────────────────────────

/* GET todos los posts */
app.get('/posts', (req, res) => {
    db.any('SELECT * FROM post ORDER BY date DESC')
    .then((data) => res.json(data))
    .catch((error) => console.log('ERROR:', error));
});

/* GET un post por id */
app.get('/posts/:id_post', (req, res) => {
    db.one('SELECT * FROM post WHERE id_post = $1', [req.params.id_post])
    .then((data) => res.json(data))
    .catch((error) => console.log('ERROR:', error));
});

/* POST nuevo post */
app.post('/posts/new', upload.single('img'), (req, res) => {
    db.none(
        'INSERT INTO post (title, text, img, date) VALUES($1, $2, $3, $4)',
        [req.body.title, req.body.text, req.file ? req.file.originalname : null, req.body.date]
    )
    .then(() => res.json({ message: 'Post agregado correctamente' }))
    .catch((error) => console.log('ERROR:', error));
});

/* GET todos los autores */
app.get('/autores', (req, res) => {
    db.any('SELECT * FROM autor')
    .then((data) => res.json(data))
    .catch((error) => console.log('ERROR:', error));
});

/* GET un autor por id */
app.get('/autores/:id_autor', (req, res) => {
    db.one('SELECT * FROM autor WHERE id_autor = $1', [req.params.id_autor])
    .then((data) => res.json(data))
    .catch((error) => console.log('ERROR:', error));
});

// ── Inicio del servidor ───────────────────────────────────────
app.listen(8000, () => {
    console.log('Servidor corriéndose en el puerto 8000');
});
