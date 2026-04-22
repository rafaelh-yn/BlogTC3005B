# Hashing de contraseñas con bcrypt

En la práctica 8 el login funciona, pero hay un problema serio: las contraseñas se guardan y comparan en **texto plano**. Esto significa que si alguien accede a tu base de datos, obtiene todas las contraseñas directamente.

La solución es **hashear** las contraseñas antes de guardarlas.

---

## ¿Qué es un hash?

Un hash es una transformación de una cadena de texto en una cadena irreconocible, y que **no se puede revertir**. Por ejemplo:

```
"gato123"  →  "$2b$10$abc123...xyz789"
```

Cuando el usuario inicia sesión, no se "desencripta" el hash — se hashea la contraseña que escribió y se compara con el hash guardado.

---

## La librería más usada: bcrypt

```bash
npm install bcrypt
```

### Al registrar un usuario (guardar contraseña hasheada)

```js
const bcrypt = require('bcrypt');

app.post('/register', upload.none(), (req, res) => {
    const { name, username, password } = req.body;

    bcrypt.hash(password, 10)
        .then((hashedPassword) => {
            return db.one(
                'INSERT INTO authors (name, username, password) VALUES ($1, $2, $3) RETURNING *',
                [name, username, hashedPassword]
            );
        })
        .then((data) => res.send(data))
        .catch((error) => console.log(error));
});
```

El número `10` es el **saltRounds** — controla qué tan lento (y seguro) es el proceso. Para la mayoría de aplicaciones, 10 está bien.

### Al hacer login (comparar contraseña con el hash)

```js
const bcrypt = require('bcrypt');

app.post('/login', upload.none(), (req, res) => {
    const { username, password } = req.body;

    db.oneOrNone('SELECT * FROM authors WHERE username=$1', [username])
        .then((data) => {
            if (data == null) {
                return res.status(401).send('Usuario o contraseña incorrectos');
            }
            return bcrypt.compare(password, data.password)
                .then((match) => {
                    if (match) {
                        req.session.id_author = data.id_author;
                        res.send(req.session);
                    } else {
                        res.status(401).send('Usuario o contraseña incorrectos');
                    }
                });
        })
        .catch((error) => console.log(error));
});
```

---

## Lo que tienes que cambiar

1. Instalar `bcrypt` en el servidor: `npm install bcrypt`
2. En el endpoint de registro (`POST /register`): hashear la contraseña antes de insertarla
3. En el endpoint de login (`POST /login`): usar `bcrypt.compare()` en lugar de `==`
4. Volver a crear los usuarios de prueba (los que ya están guardados en texto plano no van a funcionar con el hash)

---

## ¿Por qué no basta con encriptar?

La encriptación se puede revertir si tienes la llave. El hashing no se puede revertir — esa es la diferencia clave. Para contraseñas siempre se usa hashing, nunca encriptación simétrica.
