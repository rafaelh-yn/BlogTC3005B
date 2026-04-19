# Migraciones de base de datos

## ¿Por qué existen?

En el curso, cuando necesitas cambiar la estructura de la base de datos (agregar una columna, renombrar una tabla) simplemente editas `init.sql` y corres:

```bash
docker compose down -v
docker compose up db
```

Eso funciona bien mientras estás desarrollando y no te importa perder los datos. Pero en una aplicación real hay dos problemas:

1. **Tienes datos reales** — no puedes borrar la base de datos de producción solo para agregar una columna.
2. **Trabajas en equipo** — si dos personas hacen cambios al esquema al mismo tiempo, necesitan una forma de aplicar esos cambios en orden sin pisarse.

Las migraciones resuelven esto: en lugar de editar el esquema original, creas archivos numerados que describen cada cambio. Un tracker registra cuáles ya se aplicaron, y solo corre los nuevos.

```
migrations/
  001_crear_authors.sql       ← ya aplicada
  002_crear_posts.sql         ← ya aplicada
  003_agregar_author_id.sql   ← ya aplicada
  004_agregar_bio_a_authors.sql  ← nueva, se aplica sola
```

---

## db-migrate

La herramienta más directa para usar con Express + PostgreSQL. No requiere cambiar cómo usas la base de datos — solo agrega el sistema de migraciones encima.

### Instalación

```bash
cd server
npm install db-migrate db-migrate-pg
```

### Configuración

Crea un archivo `server/database.json`:

```json
{
  "dev": {
    "driver": "pg",
    "host": "localhost",
    "port": 5432,
    "database": "blogdb",
    "user": "blog_user",
    "password": "blog_pass"
  }
}
```

### Crear una migración

```bash
npx db-migrate create agregar-bio-a-authors --sql-file
```

Esto genera dos archivos en `migrations/`:
- `20240101120000-agregar-bio-a-authors-up.sql` — lo que se aplica
- `20240101120000-agregar-bio-a-authors-down.sql` — cómo deshacerlo

En el archivo `up.sql`:
```sql
ALTER TABLE authors ADD COLUMN bio TEXT;
```

En el archivo `down.sql`:
```sql
ALTER TABLE authors DROP COLUMN bio;
```

### Correr las migraciones

```bash
# Aplicar todas las migraciones pendientes
npx db-migrate up

# Deshacer la última migración
npx db-migrate down
```

db-migrate crea automáticamente una tabla `migrations` en tu base de datos para registrar cuáles ya se aplicaron.

---

## Para empezar

- Documentación: busca "db-migrate" en npm o en su repositorio de GitHub
- El concepto es el mismo en todos los frameworks — Laravel lo llama igual, Rails también
