import { firebaseConfig } from "../config.js";
import { addDays, iso } from "./dates.js";

export const isConfigured = () => Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

export async function createStore() {
  if (isConfigured()) {
    const { createFirebaseStore } = await import("./firebase.js");
    return createFirebaseStore(firebaseConfig);
  }
  return createDemoStore();
}

/* ───────────── Modo demo: datos en el navegador ───────────── */
const KEY = "sala-de-control:demo:v1";

function createDemoStore() {
  let data;
  try {
    data = JSON.parse(localStorage.getItem(KEY));
  } catch {
    data = null;
  }
  if (!data) data = sampleData();
  const listeners = { entries: new Set(), events: new Set(), sections: new Set(), settings: new Set() };
  const save = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      /* sin almacenamiento: seguimos en memoria */
    }
  };
  const emit = (name) => {
    const val = name === "settings" ? { ...data.settings } : data[name].map((x) => ({ ...x }));
    listeners[name].forEach((cb) => cb(val));
  };
  const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

  return {
    mode: "demo",
    onUser(cb) {
      setTimeout(() => cb({ uid: "demo", name: "", email: "", photo: "" }), 0);
      return () => {};
    },
    signIn: async () => {},
    signOut: async () => {},
    subscribe(name, cb) {
      listeners[name].add(cb);
      setTimeout(() => cb(data[name].map((x) => ({ ...x }))), 0);
      return () => listeners[name].delete(cb);
    },
    subscribeSettings(cb) {
      listeners.settings.add(cb);
      setTimeout(() => cb({ ...data.settings }), 0);
      return () => listeners.settings.delete(cb);
    },
    async add(name, item) {
      data[name].push({ ...item, id: uid() });
      save();
      emit(name);
    },
    async update(name, id, patch) {
      const it = data[name].find((x) => x.id === id);
      if (it) Object.assign(it, patch);
      save();
      emit(name);
    },
    async remove(name, id) {
      data[name] = data[name].filter((x) => x.id !== id);
      save();
      emit(name);
    },
    async saveSettings(patch) {
      data.settings = { ...data.settings, ...patch };
      save();
      emit("settings");
    },
    resetDemo() {
      data = sampleData();
      save();
      ["entries", "events", "sections", "settings"].forEach(emit);
    },
    clearDemo() {
      data = { entries: [], events: [], sections: [], settings: {} };
      save();
      ["entries", "events", "sections", "settings"].forEach(emit);
    },
  };
}

/* Datos de ejemplo para enseñar cómo queda la web en modo demo */
function sampleData() {
  const now = new Date();
  now.setHours(12, 0, 0, 0);
  const ago = (n) => addDays(now, -n);
  const ms = (n) => ago(n).getTime();
  let i = 0;
  const id = () => `ej${++i}`;
  const e = (o) => ({ id: id(), done: false, ...o });

  const entries = [];
  // Gimnasio: 6 semanas de progresión
  for (let w = 5; w >= 0; w--) {
    const base = w * 7 + 1;
    const p = 5 - w;
    entries.push(e({ section: "gym", kind: "Sesión", activity: "Gimnasio", text: "Empuje", date: iso(ago(base + 2)), createdAt: ms(base + 2),
      sets: [{ ex: "Press banca", s: 4, r: "8", kg: 70 + p * 2 }, { ex: "Press militar", s: 3, r: "10", kg: 35 + p }, { ex: "Fondos", s: 3, r: "12/10/8", kg: "" }] }));
    entries.push(e({ section: "gym", kind: "Sesión", activity: "Gimnasio", text: "Pierna", date: iso(ago(base + 1)), createdAt: ms(base + 1),
      sets: [{ ex: "Sentadilla", s: 4, r: "6", kg: 90 + p * 3 }, { ex: "Peso muerto rumano", s: 3, r: "10", kg: 70 + p * 2 }] }));
    entries.push(e({ section: "gym", kind: "Sesión", activity: "Correr", text: "Rodaje", date: iso(ago(base)), createdAt: ms(base),
      km: 6 + (p % 3), time: `${33 + (p % 3) * 5 - p}:${p % 2 ? "15" : "40"}` }));
  }
  entries.push(e({ section: "gym", kind: "Objetivo", text: "Press banca con 85 kg antes de Navidad", createdAt: ms(20) }));
  entries.push(e({ section: "gym", kind: "Objetivo", text: "Bajar de 5:00/km en un 10K", createdAt: ms(30) }));

  // Cine
  [["Vista", "Aftersun (2022)", 5, 3], ["Vista", "Dune: parte dos (2024)", 4, 10], ["Vista", "Perfect Days (2023)", 5, 18],
   ["Vista", "La sociedad de la nieve (2023)", 4, 26], ["Vista", "Oppenheimer (2023)", 3, 40], ["Quiero ver", "El club de la lucha (1999)", 0, 5],
   ["Quiero ver", "Drive (2011)", 0, 12], ["Me gusta", "Denis Villeneuve", 0, 30], ["Me gusta", "Películas lentas con buena fotografía", 0, 28]]
    .forEach(([kind, text, rating, d]) => entries.push(e({ section: "cine", kind, text, createdAt: ms(d), ...(rating ? { rating } : {}) })));

  // TFM
  [["Capítulo", "Introducción y objetivos", 100], ["Capítulo", "Estado del arte", 80], ["Capítulo", "Diseño del sistema", 45],
   ["Capítulo", "Implementación y pruebas", 15], ["Capítulo", "Conclusiones", 0]]
    .forEach(([kind, text, progress], k) => entries.push(e({ section: "tfm", kind, text, progress, order: k, createdAt: ms(30 - k) })));
  entries.push(e({ section: "tfm", kind: "Avance", text: "Cerrado el apartado de cinemática del robot", createdAt: ms(2) }));
  entries.push(e({ section: "tfm", kind: "Avance", text: "Reunión con el tutor: validada la arquitectura", createdAt: ms(6) }));
  entries.push(e({ section: "tfm", kind: "Pendiente", text: "Grabar el vídeo de las pruebas en el laboratorio", createdAt: ms(1) }));
  entries.push(e({ section: "tfm", kind: "Pendiente", text: "Pedir plantilla de portada a secretaría", createdAt: ms(4), done: true }));

  // Trabajo
  entries.push(e({ section: "trabajo", kind: "Avance", text: "Puesta en marcha de la estación de bombeo", createdAt: ms(3) }));
  entries.push(e({ section: "trabajo", kind: "Aprendido", text: "Plantillas de objetos en System Platform para reutilizar alarmas", createdAt: ms(8) }));
  entries.push(e({ section: "trabajo", kind: "Para el CV", text: "Migración de 40 pantallas de HMI a la nueva plantilla", createdAt: ms(15) }));
  entries.push(e({ section: "trabajo", kind: "Pendiente", text: "Documentar los FB de control de bombas", createdAt: ms(1) }));

  // Personal
  const moods = [4, 3, 5, 4, 2, 4, 5];
  moods.forEach((m, k) => entries.push(e({ section: "personal", kind: "Diario", mood: m, q: "¿Qué ha sido lo mejor de hoy?",
    text: ["Buen entreno de pierna y cena tranquila.", "Día largo en la obra, pero avancé.", "Domingo de Retiro y peli.", "Llamada larga con la familia.", "Cansado, poco que contar.", "Me salió el script a la primera.", "Escapada con amigos."][k],
    createdAt: ms(k + 1) })));
  entries.push(e({ section: "personal", kind: "Plan", text: "Cena con los del máster", date: iso(addDays(now, 3)), createdAt: ms(2) }));
  entries.push(e({ section: "personal", kind: "Plan", text: "Fin de semana en Vigo", date: iso(addDays(now, 12)), createdAt: ms(5) }));
  entries.push(e({ section: "personal", kind: "Logro", text: "Una semana entera sin saltarme un entreno", createdAt: ms(1) }));
  entries.push(e({ section: "personal", kind: "Deseo", text: "Sobrecamisa de lana gris", price: 70, createdAt: ms(9) }));
  entries.push(e({ section: "personal", kind: "Me gusta", text: "Ropa de tonos tierra y prendas básicas buenas", createdAt: ms(20) }));

  const events = [
    { id: id(), title: "Gimnasio", section: "gym", mode: "weekly", weekday: 0, time: "19:00" },
    { id: id(), title: "Gimnasio", section: "gym", mode: "weekly", weekday: 2, time: "19:00" },
    { id: id(), title: "Gimnasio", section: "gym", mode: "weekly", weekday: 4, time: "18:30" },
    { id: id(), title: "Correr", section: "gym", mode: "weekly", weekday: 5, time: "10:00" },
    { id: id(), title: "Bloque de TFM", section: "tfm", mode: "weekly", weekday: 6, time: "11:00" },
    { id: id(), title: "Tutoría TFM", section: "tfm", mode: "date", date: iso(addDays(now, 2)), time: "17:00" },
  ];
  return {
    entries,
    events,
    sections: [],
    settings: { gymGoal: 3, runGoal: 2, tfmDeadline: iso(addDays(now, 54)) },
  };
}
