-- ============================================================
-- Blog de Mascotas — inicialización de la base de datos
-- Prácticas 4–7
-- ============================================================

-- Tabla de autores
CREATE TABLE IF NOT EXISTS authors (
  id_author  SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  username   TEXT UNIQUE,
  password   TEXT
);

-- Tabla de posts
CREATE TABLE IF NOT EXISTS posts (
  id_post    SERIAL PRIMARY KEY,
  title      TEXT NOT NULL,
  text       TEXT,
  img        TEXT,
  date       DATE,
  author_id  INTEGER REFERENCES authors(id_author)
);

-- ============================================================
-- Datos de prueba
-- ============================================================

INSERT INTO authors (name, username, password) VALUES
  ('Ana García',    'ana',    '1234'),
  ('Luis Martínez', 'luis',   '1234'),
  ('Sofia Ramos',   'sofia',  '1234')
ON CONFLICT DO NOTHING;

INSERT INTO posts (title, text, img, date, author_id) VALUES
  ('Bienvenidos al blog',       'Este es el primer post del blog de mascotas. ¡Esperamos que lo disfrutes!', NULL, '2023-12-01', 1),
  ('Cuidados básicos para perros', 'Los perros necesitan ejercicio diario, alimentación balanceada y visitas regulares al veterinario.', NULL, '2023-12-05', 2),
  ('Gatos y su independencia',  'Los gatos son animales independientes pero también necesitan atención y cariño de sus dueños.', NULL, '2023-12-10', 1),
  ('Alimentación para conejos', 'Los conejos deben comer principalmente heno, verduras frescas y agua limpia todos los días.', NULL, '2023-12-15', 3)
ON CONFLICT DO NOTHING;
