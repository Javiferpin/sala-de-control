# Sala de control

Tu web personal: semana, gimnasio y running, cine, TFM, trabajo y un área personal con diario, planes, logros y lista de deseos. Además puedes crear secciones nuevas desde la propia web.

Todo es **gratis**:

| Pieza | Servicio | Coste |
|---|---|---|
| Alojamiento de la web | GitHub Pages | Gratis (repositorio público) |
| Base de datos e inicio de sesión | Firebase (plan Spark) | Gratis hasta 50.000 lecturas y 20.000 escrituras al día |
| Estrenos de cine (opcional) | TMDB | Gratis |
| Ideas con IA (opcional) | API de Claude | De pago por uso (céntimos al mes) |

Mientras no conectes Firebase, la web funciona en **modo demo**: muestra datos de ejemplo y guarda lo que apuntas solo en tu navegador.

---

## Paso 1 · Crear el proyecto de Firebase (10 minutos)

1. Entra en <https://console.firebase.google.com> con tu cuenta de Google y pulsa **Crear un proyecto**. Llámalo `sala-de-control`. Google Analytics no hace falta.
2. En la página del proyecto, pulsa el icono **Web** (`</>`) para añadir una app web. Ponle un nombre. *No* marques Firebase Hosting.
3. Te enseñará un bloque `firebaseConfig` con `apiKey`, `authDomain`, `projectId`… Copia esos valores en **`src/config.js`**.
   No son secretos: lo que protege tus datos son las reglas del paso 5.
4. Menú **Compilación → Authentication → Comenzar**. En **Método de acceso**, activa **Google** y guarda.
5. Menú **Compilación → Firestore Database → Crear base de datos**:
   - Ubicación: `europe-southwest1 (Madrid)`.
   - Modo: **producción**.
   - Cuando esté creada, ve a la pestaña **Reglas**, borra lo que haya, pega el contenido del archivo `firestore.rules` y pulsa **Publicar**.

## Paso 2 · Subir el código a GitHub

1. Crea una cuenta en <https://github.com> si no tienes.
2. Crea un repositorio nuevo **público** llamado `sala-de-control` (sin README).
3. Sube el contenido de esta carpeta. La forma más cómoda, desde una terminal dentro de la carpeta:

   ```bash
   git init
   git add .
   git commit -m "Primera versión"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/sala-de-control.git
   git push -u origin main
   ```

   Si prefieres no usar la terminal, instala **GitHub Desktop** y usa *Add existing repository*.
   Ojo si lo subes arrastrando archivos en la web de GitHub: la carpeta `.github` está oculta y tiene que subirse también.

## Paso 3 · Publicar la web

1. En tu repositorio: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Ve a la pestaña **Actions**. Verás "Publicar en GitHub Pages" en marcha. Si no ha arrancado, entra y pulsa **Run workflow**.
3. Al terminar (1-2 minutos), tu web estará en:
   **`https://TU_USUARIO.github.io/sala-de-control/`**

## Paso 4 · Autorizar tu dominio en Firebase

En Firebase: **Authentication → Configuración → Dominios autorizados → Agregar dominio** y escribe `TU_USUARIO.github.io`.
Sin esto, el botón *Entrar con Google* dará error.

## Paso 5 · Tenerla como app en el móvil

Abre la web en el móvil, entra con Google y:
- **iPhone (Safari):** Compartir → *Añadir a pantalla de inicio*.
- **Android (Chrome):** menú ⋮ → *Añadir a pantalla de inicio* o *Instalar app*.

## Paso 6 · Conectar Google Calendar (y verlo en el iPhone)

La web lee tus eventos de Google Calendar (aparecen en Semana e Inicio con una raya discontinua) y puede crear eventos nuevos al añadir algo al calendario o un plan con fecha.

1. Entra en <https://console.cloud.google.com> y arriba elige el **mismo proyecto** que creaste en Firebase.
2. **APIs y servicios → Biblioteca** → busca **Google Calendar API** → **Habilitar**.
3. **Google Auth Platform** (en algunas cuentas se llama *Pantalla de consentimiento de OAuth*):
   - En **Público** (*Audience*): si el estado es *Prueba*, añade tu Gmail en **Usuarios de prueba**.
4. **APIs y servicios → Credenciales** (o *Google Auth Platform → Clientes*): abre **Web client (auto created by Google Service)**.
   - En **Orígenes de JavaScript autorizados** añade `https://TU_USUARIO.github.io` (y `http://localhost:5173` si pruebas en tu ordenador). Guarda.
   - Copia el **ID de cliente** (termina en `.apps.googleusercontent.com`) y pégalo en `googleClientId` dentro de `src/config.js`. Sube el cambio.
5. En la web, pulsa **Conectar Google Calendar**. La primera vez Google puede avisar de que la app no está verificada: es tu propia app, pulsa **Configuración avanzada → Ir a sala-de-control**.

El permiso de Google dura una hora. Cuando caduque, la web te mostrará un botón **Reconectar** (un clic).

**En el iPhone:** Ajustes → Apps → Calendario → Cuentas de calendario → Añadir cuenta → Google (en iOS antiguos: Ajustes → Calendario → Cuentas). Activa *Calendarios*. Lo que crees desde la web aparecerá también en el calendario del iPhone, y al revés.

---

## Añadir cosas cuando quieras

- **Sin programar:** en **Ajustes → Secciones propias** creas secciones nuevas (lecturas, viajes, recetas…) con sus tipos de entrada y su color.
- **Cambios en el diseño o funciones nuevas:** pídeselo a Claude. Cada vez que subas cambios a `main`, la web se vuelve a publicar sola.
- **Editar a mano:** cada sección está en `src/sections/`. El diseño entero está en `src/styles.css` (los colores de cada sección están arriba del todo).

## Opcionales

- **Estrenos de cine:** crea una cuenta en <https://www.themoviedb.org>, pide una clave de API (gratis) y pégala en `tmdbKey` dentro de `src/config.js`. En Cine aparecerá la pestaña *En cines*.
- **Ideas con IA:** en **Ajustes → Ideas con IA** pega una clave de <https://console.anthropic.com>. Se guarda solo en el navegador donde la pegues. Es de pago por uso.

## Probar en tu ordenador (opcional)

Necesitas Node.js (versión LTS).

```bash
npm install
npm run dev
```

Y abre la dirección que aparece (normalmente `http://localhost:5173`). Añade `localhost` a los dominios autorizados de Firebase si quieres iniciar sesión en local (suele venir ya).

## Estructura

```
src/
  config.js          ← tus claves (lo único que tienes que tocar)
  styles.css         ← todo el diseño
  ui.jsx             ← piezas comunes: cabeceras, formularios, listas, gráficas
  lib/
    store.js         ← guarda los datos (Firebase o modo demo)
    firebase.js      ← conexión con Firebase
    ideas.js         ← banco de ideas, IA y estrenos
    dates.js         ← utilidades de fechas
  sections/          ← una pantalla por sección
firestore.rules      ← reglas de seguridad de la base de datos
.github/workflows/   ← publicación automática en GitHub Pages
```

## Privacidad

El código es público (así GitHub Pages es gratis), pero **tus datos no**: están en tu Firebase y las reglas solo dejan leerlos y escribirlos a la cuenta de Google que los creó.
