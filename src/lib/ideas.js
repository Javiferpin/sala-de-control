// Ideas para cada sección: un banco propio (gratis) + IA opcional + estrenos de cine (TMDB, gratis).
import { tmdbKey } from "../config.js";

export const BANK = {
  gym: [
    { title: "Semana de descarga", detail: "Cada 5-6 semanas baja un 40 % el volumen. Vuelves con más fuerza y menos molestias." },
    { title: "Series de fondos con lastre", detail: "Cuando hagas 3×12 limpias, añade 5 kg con un cinturón." },
    { title: "Progresión doble", detail: "Sube repeticiones hasta el tope del rango y entonces sube peso. Fácil de seguir con la tabla de series." },
    { title: "Rodaje en zona 2", detail: "Una salida a ritmo cómodo, pudiendo hablar. Mejora la base aeróbica sin machacarte." },
    { title: "Series de 400 m", detail: "6-8 × 400 m rápidos con 90 s de trote. Para bajar tu ritmo en 10K." },
    { title: "Movilidad de cadera 10 minutos", detail: "Antes de pierna: 90/90, sentadilla profunda y estiramiento de flexores." },
    { title: "Dominadas como test mensual", detail: "Apunta cuántas haces el primer día de cada mes y mira la evolución." },
    { title: "Unilateral para equilibrar", detail: "Zancadas búlgaras o remo a una mano: corrigen diferencias entre lados." },
    { title: "Tirada larga del mes", detail: "Una vez al mes, corre un 30 % más que tu salida más larga, muy suave." },
    { title: "Apunta el RPE", detail: "Pon en la sesión cómo de dura fue del 1 al 10. Te ayuda a no pasarte." },
    { title: "Carrera popular en Madrid", detail: "Elige un 10K de los próximos meses y úsalo como objetivo de los entrenos." },
    { title: "Peso muerto con pausa", detail: "Pausa de 1 s bajo la rodilla para mejorar la técnica y la fuerza en el arranque." },
  ],
  cine: [
    { title: "Ex Machina (2014)", detail: "Alex Garland. Un ingeniero y una IA en un búnker. Muy de tu mundo." },
    { title: "Robot Dreams (2023)", detail: "Pablo Berger. Animación española sin diálogos sobre un perro y su robot. Emociona." },
    { title: "Tiempos modernos (1936)", detail: "Charles Chaplin. La cadena de montaje vista con humor: un clásico de la automatización." },
    { title: "Prisioneros (2013)", detail: "Denis Villeneuve. Thriller tenso y oscuro, de los mejores del director." },
    { title: "Incendies (2010)", detail: "Denis Villeneuve. Drama que te deja pensando días." },
    { title: "As bestas (2022)", detail: "Rodrigo Sorogoyen. Rodada en la Galicia rural, tensión que va creciendo." },
    { title: "O que arde (2019)", detail: "Oliver Laxe. Los Ancares lucenses, fuego y silencio. Muy visual." },
    { title: "Los lunes al sol (2002)", detail: "Fernando León de Aranoa. Vigo y los astilleros. Imprescindible." },
    { title: "Paris, Texas (1984)", detail: "Wim Wenders. Si te gustó Perfect Days, esta es la otra cara del director." },
    { title: "Deseando amar (2000)", detail: "Wong Kar-wai. Para quien le gusta la ropa: los vestidos y la fotografía son historia del cine." },
    { title: "El hilo invisible (2017)", detail: "Paul Thomas Anderson. Un modisto obsesivo en el Londres de los 50." },
    { title: "Drive My Car (2021)", detail: "Ryusuke Hamaguchi. Lenta, precisa y muy humana." },
    { title: "Vidas pasadas (2023)", detail: "Celine Song. Pequeña, elegante y con un final que se queda contigo." },
    { title: "Heat (1995)", detail: "Michael Mann. Pacino y De Niro, y uno de los mejores tiroteos del cine." },
    { title: "Zodiac (2007)", detail: "David Fincher. Una obsesión meticulosa, como un buen proyecto de ingeniería." },
    { title: "Whiplash (2014)", detail: "Damien Chazelle. Disciplina llevada al extremo. Ideal antes de entrenar." },
    { title: "Alcarràs (2022)", detail: "Carla Simón. Una familia, un verano y el fin de una forma de vida." },
    { title: "Wall·E (2008)", detail: "Andrew Stanton. El robot más tierno del cine. Mejor de lo que recuerdas." },
  ],
  tfm: [
    { title: "Bloques de 90 minutos", detail: "Reserva en tu semana bloques fijos para el TFM, como si fueran reuniones." },
    { title: "Escribe primero las figuras", detail: "Haz los diagramas y gráficas de resultados y luego redacta alrededor de ellas." },
    { title: "Índice con páginas objetivo", detail: "Pon a cada capítulo un número de páginas. Saber cuánto falta motiva." },
    { title: "Resumen y abstract al final", detail: "Se escriben mejor cuando el resto está cerrado. No te atasques ahí ahora." },
    { title: "Manda borradores al tutor por capítulos", detail: "Mejor correcciones pequeñas cada dos semanas que una grande al final." },
    { title: "Graba las pruebas", detail: "Vídeo y logs de cada prueba del sistema. Te servirán en la defensa." },
    { title: "Prepara la defensa en 15 diapositivas", detail: "Una idea por diapositiva y una demo corta grabada por si falla el directo." },
    { title: "Gestor de referencias", detail: "Zotero es gratis y genera la bibliografía en el formato que pidan." },
    { title: "Lista de \"no hacer\"", detail: "Apunta mejoras que no harás ahora. Van al capítulo de trabajo futuro." },
  ],
  trabajo: [
    { title: "TIA Openness", detail: "La API de TIA Portal para generar bloques y proyectos con C#. Ahorra horas en tareas repetitivas." },
    { title: "OPC UA a fondo", detail: "El estándar de comunicación entre PLC, SCADA e IT. Muy pedido en ofertas." },
    { title: "ISA-101 para tus pantallas", detail: "Guía de HMI de alto rendimiento: grises, color solo para alarmas." },
    { title: "IEC 62443", detail: "Ciberseguridad industrial. Cada vez más proyectos la exigen y pocos perfiles la dominan." },
    { title: "ISA-88 y control por lotes", detail: "Clave en farma y alimentación, sectores con mucho empleo en Galicia." },
    { title: "Python para datos de planta", detail: "Leer históricos, hacer informes automáticos y gráficos de tendencias." },
    { title: "MQTT y Node-RED", detail: "Para pruebas rápidas de IIoT en casa con muy poco hardware." },
    { title: "Portafolio de proyectos", detail: "Una página con 3-4 proyectos reales anonimizados. Muy útil para las entrevistas." },
    { title: "Certificación de AVEVA", detail: "Mira las certificaciones oficiales de System Platform. Perfil de nicho y bien pagado." },
    { title: "Librería propia de FB", detail: "Motores, válvulas y PID estándar, documentados y probados. Reutilizables en cada proyecto." },
  ],
  personal: [
    { title: "Atardecer en el Templo de Debod", detail: "Uno de los mejores atardeceres de Madrid, y gratis." },
    { title: "Sesión en el Cine Doré", detail: "La Filmoteca Española en Lavapiés: clásicos en pantalla grande a precio muy bajo." },
    { title: "Museo del Traje", detail: "Para quien le gusta la moda: historia de la ropa en España, en Moncloa." },
    { title: "Domingo en El Rastro", detail: "Pronto por la mañana, y luego vermut por La Latina." },
    { title: "Ruta de vintage por Malasaña", detail: "Tiendas de segunda mano para encontrar prendas únicas." },
    { title: "Siete Picos desde Cercedilla", detail: "Ruta por la sierra en tren desde Madrid. Buen plan de domingo activo." },
    { title: "Escapada a Segovia", detail: "Media hora en tren rápido. Acueducto, catedral y cochinillo." },
    { title: "Armario cápsula de otoño", detail: "Elige 12 prendas que combinen entre sí y vístete solo con ellas un mes." },
    { title: "Tonos tierra y capas", detail: "Sobrecamisa, punto fino y pantalón recto: fácil y queda bien." },
    { title: "Reto: 30 días de diario", detail: "Una entrada al día, aunque sea una línea. Mira tu racha en esta sección." },
    { title: "Un plato nuevo por semana", detail: "Apunta cada receta como logro. En dos meses tienes un repertorio." },
    { title: "Carta a ti mismo dentro de un año", detail: "Escríbela en el diario y pon un plan con la fecha para leerla." },
    { title: "Islas Cíes en verano", detail: "Planifícalo con tiempo: hay que reservar la autorización de la Xunta." },
  ],
};

export function pickIdeas(section, saved = [], n = 4, bank = BANK) {
  const pool = (bank[section] || []).filter((i) => !saved.some((s) => s.includes(i.title)));
  return [...pool].sort(() => Math.random() - 0.5).slice(0, n);
}

/* IA opcional: tu propia clave de la API de Claude, guardada solo en este navegador */
export const AI_KEY = "sala-de-control:claude-key";
export const getAiKey = () => {
  try {
    return localStorage.getItem(AI_KEY) || "";
  } catch {
    return "";
  }
};

export async function askClaude(prompt) {
  const key = getAiKey();
  if (!key) throw new Error("Falta la clave de la API en Ajustes.");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-haiku-5-5",
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("La clave de la API no es válida. Revísala en Ajustes.");
    if (res.status === 429) throw new Error("Demasiadas peticiones seguidas. Prueba en un rato.");
    throw new Error(`La API ha respondido con un error (${res.status}).`);
  }
  const json = await res.json();
  const text = (json.content || []).map((c) => c.text || "").join("");
  const m = text.match(/\[[\s\S]*\]/);
  const arr = m ? JSON.parse(m[0]) : [];
  return arr.filter((x) => x && x.title).map((x) => ({ title: String(x.title), detail: String(x.detail || "") }));
}

/* Estrenos en cines de España (TMDB, gratis con tu clave) */
export const hasTmdb = () => Boolean(tmdbKey);
export async function fetchEstrenos(kind = "now_playing") {
  const url = `https://api.themoviedb.org/3/movie/${kind}?language=es-ES&region=ES&page=1&api_key=${encodeURIComponent(tmdbKey)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("No se han podido cargar los estrenos. Revisa la clave de TMDB.");
  const json = await res.json();
  return (json.results || []).slice(0, 12).map((m) => ({
    title: `${m.title}${m.release_date ? ` (${m.release_date.slice(0, 4)})` : ""}`,
    detail: (m.overview || "").slice(0, 160) + ((m.overview || "").length > 160 ? "…" : ""),
    poster: m.poster_path ? `https://image.tmdb.org/t/p/w185${m.poster_path}` : "",
    rating: m.vote_average ? Math.round(m.vote_average * 10) / 10 : null,
    date: m.release_date || "",
  }));
}
