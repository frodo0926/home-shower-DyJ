# Home Shower · Hogar Daniel y Jimena

Guía para que **todos los invitados vean la misma lista en vivo** (Google Sheets) y para **publicar el sitio en Vercel**.

> El nombre correcto de la plataforma es **Vercel** (vercel.com).

---

## Cómo encaja todo

```
Invitado abre tu URL de Vercel
        ↓
La página pide la lista a Google Apps Script
        ↓
Apps Script lee/escribe la hoja "Regalos"
        ↓
Si alguien elige un regalo, se guarda el nombre en la columna reservadoPor
        ↓
Los demás, al refrescar (o a los 20 segundos), ven la tarjeta volteada
```

Sin Google Sheets, las reservas solo viven en el navegador de cada persona. Con Sheets, es una sola lista para todos.

---

## Parte 1 · Google Sheets

### 1. Crea la hoja

1. Entra a [Google Sheets](https://sheets.google.com) con tu cuenta.
2. **Nueva hoja de cálculo**.
3. Renómbrala, por ejemplo: `Home Shower Daniel y Jimena`.
4. Abajo, renombra la pestaña a exactamente: **`Regalos`**.

### 2. Importa los regalos

1. **Archivo → Importar → Subir** el archivo `regalos.csv` de esta carpeta.
2. Tipo de separador: **Punto y coma** (`;`). No uses coma: los versículos también tienen comas y se descuadra la tabla.
3. Elige **Reemplazar la hoja actual**.
3. Comprueba que la fila 1 tenga exactamente estos encabezados:

| id | articulo | categoria | detalle | versiculo | cita | reservadoPor | icon |
|----|----------|-----------|---------|-----------|------|--------------|------|

4. Deja **reservadoPor** vacía. Ahí se escribirá el nombre del invitado.
5. Puedes editar artículos, versículos o agregar filas. El `id` debe ser único y sin espacios (ej. `sabanas`).

### 3. Pega el Apps Script

1. En la hoja: **Extensiones → Apps Script**.
2. Borra el código de ejemplo.
3. Copia todo el contenido de `apps-script/Code.gs` y pégalo.
4. Guarda (el disquete) con el nombre `Home Shower API`.

### 4. Publícalo como aplicación web

1. Arriba a la derecha: **Implementar → Nueva implementación**.
2. Tipo: **Aplicación web**.
3. Descripción: `v1`.
4. **Ejecutar como:** Yo (tu cuenta).
5. **Quién tiene acceso:** **Cualquier persona**.
6. **Implementar**.
7. Autoriza los permisos (cuenta Google → Avanzado → Ir a Home Shower API → Permitir).
8. Copia la **URL** que termina en `/exec`.  
   Se ve así:  
   `https://script.google.com/macros/s/AKfycb.../exec`

### 5. Conéctala al sitio

En `index.html`, busca:

```js
apiUrl: ""
```

y pega la URL:

```js
apiUrl: "https://script.google.com/macros/s/AKfycb.../exec"
```

Prueba: abre esa URL en el navegador. Debes ver un JSON con `"regalos":[...]`.

### Si cambias el código del Script

**Implementar → Administrar implementaciones → lápiz → Nueva versión → Implementar.**  
Si solo das “Nueva implementación” sin actualizar la anterior, la URL vieja no cambia.

### Cómo se usa el día del evento

- Un invitado elige un regalo → se escribe su nombre en Sheets.
- Otro invitado, en otro celular, ve esa tarjeta volteada.
- Si alguien se arrepiente y pulsa **Cambiar de parecer**, se borra `reservadoPor` y la tarjeta vuelve al frente.
- La página se actualiza sola cada 20 segundos, o con **↻ Actualizar**.

---

## Parte 2 · Publicar en Vercel

El sitio es estático (`index.html` + carpeta `images`). Vercel lo sirve gratis.

### Opción A — Desde GitHub (recomendada)

1. Crea un repositorio en GitHub (puede ser privado).
2. Sube **toda esta carpeta** (`index.html`, `images/`, `vercel.json`, etc.).
3. Entra a [vercel.com](https://vercel.com) e inicia sesión con GitHub.
4. **Add New → Project → Import** tu repositorio.
5. Framework Preset: **Other**.
6. Root Directory: `.` (la carpeta donde está `index.html`).
7. **Deploy**.
8. Te da una URL tipo `https://home-shower-daniel-jimena.vercel.app`.

Cada vez que hagas `git push`, Vercel vuelve a publicar.

### Opción B — Arrastrar la carpeta

1. En Vercel: **Add New → Project**.
2. Si te deja subir archivos, arrastra la carpeta del proyecto.
3. Deploy.

### Opción C — Terminal

```bash
cd home-shower
npx vercel
```

Sigue el login y confirma. Luego, para producción:

```bash
npx vercel --prod
```

### Dominio propio (opcional)

En el proyecto de Vercel: **Settings → Domains** → agrega `homeshowers.com` o el que tengas y sigue las instrucciones DNS.

---

## Orden recomendado

1. Google Sheet + Apps Script (Parte 1).
2. Pegas `apiUrl` en `index.html`.
3. Pruebas en local (abrir `index.html` o la preview).
4. Publicas en Vercel (Parte 2).
5. Envías el link de Vercel a los invitados.

---

## Problemas frecuentes

| Qué ves | Qué hacer |
|---|---|
| `Cargando la lista…` y no avanza | Revisa `apiUrl`. Abre la URL `/exec` en el navegador. |
| JSON de error `No existe la hoja "Regalos"` | El nombre de la pestaña debe ser exactamente `Regalos`. |
| “Ese cupo ya fue reservado” | Otro invitado llegó primero. Mira la columna `reservadoPor`. |
| Cambiaste el Script y el sitio no cambia | Debes **actualizar la implementación** (nueva versión). |
| Las imágenes no salen en Vercel | Confirma que subiste la carpeta `images/` junto a `index.html`. |
| Quieres quitar un regalo | Borra la fila en Sheets. No hace falta redesplegar Vercel. |
| Quieres agregar un regalo | Nueva fila en Sheets, `id` único. Tampoco hay que redesplegar. |
