// ─────────────────────────────────────────────────────────────
//  CONFIGURACIÓN — el único archivo que tienes que tocar.
// ─────────────────────────────────────────────────────────────
//
// 1) Pega aquí la configuración de tu proyecto de Firebase
//    (Consola de Firebase → Configuración del proyecto → Tus apps → Web).
//    Estos valores NO son secretos: tus datos los protegen las reglas
//    de Firestore (archivo firestore.rules) y el inicio de sesión.
//
//    Mientras esté vacío, la web funciona en "modo demo": guarda los datos
//    solo en tu navegador y muestra datos de ejemplo.
export const firebaseConfig = {
  apiKey: "AIzaSyCHG1m4kEJ13izpxeKMZiRDlPECR9XoDhE",
  authDomain: "sala-de-control-8297e.firebaseapp.com",
  projectId: "sala-de-control-8297e",
  storageBucket: "sala-de-control-8297e.firebasestorage.app",
  messagingSenderId: "892803103989",
  appId: "1:892803103989:web:a5c5a62eef6f52cf2b99bc",
};

// 2) (Opcional, gratis) Google Calendar: el "ID de cliente web" de tu proyecto.
//    Firebase → Authentication → Método de acceso → Google → "Configuración del SDK web".
//    Termina en ".apps.googleusercontent.com".
export const googleClientId = "892803103989-6k7voiup94l15vfin7oor84h22rn6o14.apps.googleusercontent.com";

// 3) (Opcional, gratis) Clave de TMDB para ver estrenos de cine en España.
//    Se consigue en https://www.themoviedb.org/settings/api
export const tmdbKey = "";
