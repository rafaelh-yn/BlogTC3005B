# Cloudinary — almacenamiento de imágenes en la nube

## ¿Por qué existe?

En el proyecto guardamos las imágenes en el disco del servidor (`client/src/assets/uploads/`). Esto funciona en desarrollo, pero tiene dos problemas serios en producción:

1. **Render y la mayoría de plataformas cloud borran el sistema de archivos** cada vez que redespliegas. Todas las imágenes subidas por usuarios desaparecen.
2. **El disco del servidor no escala** — si tuvieras miles de usuarios subiendo fotos, llenarías el disco rápido.

Cloudinary es un servicio que resuelve exactamente esto: en lugar de guardar la imagen en disco, la mandas a Cloudinary y ellos te devuelven una URL pública donde está almacenada. Tú guardas esa URL en la base de datos.

---

## El cambio conceptual

```
Antes:  usuario sube foto → multer guarda en /uploads/ → guardas el path en DB
Después: usuario sube foto → mandas el archivo a Cloudinary → guardas la URL que te dan en DB
```

La URL que te devuelve Cloudinary se ve así:
```
https://res.cloudinary.com/tu-cuenta/image/upload/v123456/foto.jpg
```

---

## ¿Por qué Cloudinary y no AWS S3?

Cloudinary tiene un tier gratuito generoso y el setup es solo registrarse con email. AWS S3 requiere crear una cuenta de AWS, configurar IAM (permisos), crear un bucket con políticas correctas — hay muchas cosas que pueden salir mal y que son difíciles de depurar la primera vez.

---

## ¿Cómo lo integrarías en este proyecto?

En `server.js`, en lugar de configurar multer con `dest`, usarías multer con almacenamiento en memoria y luego subirías el buffer a Cloudinary:

```js
// npm install cloudinary multer
const cloudinary = require('cloudinary').v2
const multer = require('multer')

cloudinary.config({
  cloud_name: 'tu_cloud_name',
  api_key: 'tu_api_key',
  api_secret: 'tu_api_secret'
})

const storage = multer.memoryStorage()
const upload = multer({ storage })

app.post('/posts', upload.single('img'), (req, res) => {
  const stream = cloudinary.uploader.upload_stream((error, resultado) => {
    if (error) {
      console.log(error)
      return res.status(500).json({ error: 'Error al subir imagen' })
    }

    const urlImagen = resultado.secure_url
    // guardar urlImagen en la base de datos en lugar de un path local
  })

  stream.end(req.file.buffer)
})
```

---

## Para empezar

- Registro: [cloudinary.com](https://cloudinary.com) — cuenta gratuita, no requiere tarjeta de crédito
- Documentación: busca "Cloudinary Node.js SDK" en su sitio oficial
- Busca ejemplos de `multer + cloudinary + express` — hay muchos tutoriales
