# Exportar datos a Excel desde Express

Esta guía explica cómo generar un archivo `.xlsx` desde un endpoint de Express usando datos de PostgreSQL. Está pensada para que la adaptes a tu propio proyecto — los nombres de tablas y columnas son genéricos.

---

## Librería recomendada: `exceljs`

```bash
npm install exceljs
```

`exceljs` permite crear libros de Excel desde cero, definir columnas, agregar filas y enviar el archivo directamente en la respuesta HTTP — sin guardar nada en disco.

---

## Implementación básica

```js
const ExcelJS = require('exceljs');

// GET /export
app.get('/export', async (req, res) => {
  const result = await pool.query('SELECT * FROM mi_tabla LIMIT 500');

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Datos');

  sheet.columns = [
    { header: 'ID',     key: 'id' },
    { header: 'Nombre', key: 'nombre' },
    { header: 'Fecha',  key: 'fecha' },
  ];

  sheet.addRows(result.rows);

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', 'attachment; filename=datos.xlsx');

  await workbook.xlsx.write(res);
  res.end();
});
```

Los `headers` le dicen al navegador que la respuesta es un archivo descargable, no JSON.

---

## ¿Qué puede salir mal?

Cuando un usuario hace clic en "Exportar", el servidor ejecuta una query que puede devolver cientos o miles de filas. Mientras esa query corre y el archivo se genera, **el proceso de Node está ocupado** y el pool de conexiones a la base de datos tiene una conexión tomada.

Si varios usuarios exportan al mismo tiempo, o si la tabla tiene muchos registros, esto puede:

- Agotar el pool de conexiones (otras peticiones quedan esperando)
- Hacer que el servidor tarde en responder o deje de responder temporalmente
- Generar archivos muy pesados que el navegador no puede manejar bien

---

## Mitigaciones

### 1. Siempre usa `LIMIT`

Es lo mínimo. Nunca hagas `SELECT *` sin límite en un endpoint de exportación.

```js
const result = await pool.query('SELECT * FROM mi_tabla LIMIT 500');
```

Define un límite razonable para tu caso — 500 o 1000 filas suele ser suficiente para reportes operativos.

### 2. Permite filtrar antes de exportar

En lugar de exportar toda la tabla, deja que el usuario acote los datos con parámetros en la URL:

```js
app.get('/export', async (req, res) => {
  const { desde, hasta } = req.query;

  const result = await pool.query(
    'SELECT * FROM mi_tabla WHERE fecha BETWEEN $1 AND $2 LIMIT 500',
    [desde, hasta]
  );

  // ... resto del código igual
});
```

El usuario exporta solo lo que necesita (`/export?desde=2024-01-01&hasta=2024-03-31`), la query es más rápida y el archivo más manejable.

### 3. Deshabilita el botón mientras la petición está en vuelo

Evita que el usuario haga clic varias veces mientras espera, lo que dispararía múltiples exportaciones simultáneas.

```jsx
const [exportando, setExportando] = useState(false);

async function handleExport() {
  setExportando(true);
  const res = await fetch('/export');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'datos.xlsx';
  a.click();
  setExportando(false);
}

<button onClick={handleExport} disabled={exportando}>
  {exportando ? 'Generando...' : 'Exportar Excel'}
</button>
```

---

## Nota sobre CSV

`exceljs` también soporta CSV con el mismo flujo — solo cambia el método y los headers:

```js
res.setHeader('Content-Type', 'text/csv');
res.setHeader('Content-Disposition', 'attachment; filename=datos.csv');
await workbook.csv.write(res);
```

Si tu proyecto no necesita formato Excel (fórmulas, estilos, múltiples hojas), CSV es más simple y ligero.