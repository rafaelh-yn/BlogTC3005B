-- ============================================================
-- Blog de Mascotas — inicialización de la base de datos
-- Prácticas 4–7
-- ============================================================

-- Tabla de posts
CREATE TABLE IF NOT EXISTS post (
  id_post  SERIAL PRIMARY KEY,
  title    TEXT NOT NULL,
  text     TEXT,
  img      TEXT,
  date     DATE
);

-- Tabla de autores
CREATE TABLE IF NOT EXISTS autor (
  id_autor  SERIAL PRIMARY KEY,
  name      TEXT NOT NULL,
  username  TEXT UNIQUE,
  password  TEXT
);

-- ============================================================
-- Datos de prueba — algunos posts para que el blog no esté vacío
-- ============================================================

INSERT INTO post (title, text, img, date) VALUES
  ('Primer post',   'Bienvenidos al blog de mascotas.', NULL, '2023-12-01'),
  ('Segundo post',  'Este es el segundo post del blog.', NULL, '2023-12-01'),
  ('Tercer post',   'Este es el tercer post del blog.',  NULL, '2023-12-01')
ON CONFLICT DO NOTHING;
