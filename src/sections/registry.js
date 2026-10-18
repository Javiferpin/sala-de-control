// Secciones fijas de la web. Para añadir una sección nueva sin programar,
// usa "Ajustes → Secciones propias". Para una con pantalla a medida, crea un
// componente en esta carpeta y añádelo aquí.
export const SECTIONS = {
  inicio: { label: "Inicio", short: "Inicio", color: "var(--c-inicio)" },
  semana: { label: "Semana", short: "Semana", color: "var(--c-semana)" },
  gym: {
    label: "Gimnasio y running", short: "Gimnasio", color: "var(--c-gym)",
    kinds: ["Sesión", "Marca", "Objetivo", "Pendiente"],
    ph: {
      Sesión: "Nombre de la sesión: pierna, empuje, rodaje…",
      Marca: "Ej.: sentadilla 110 kg, 10K en 48:30",
      Objetivo: "Ej.: correr una media maratón en primavera",
      Pendiente: "Algo que quieras probar o cambiar",
    },
  },
  cine: {
    label: "Cine", short: "Cine", color: "var(--c-cine)",
    kinds: ["Vista", "Quiero ver", "Me gusta"],
    ph: { Vista: "Título y año", "Quiero ver": "Título que tienes pendiente", "Me gusta": "Un director, actor, género o estilo" },
  },
  tfm: {
    label: "TFM", short: "TFM", color: "var(--c-tfm)",
    kinds: ["Avance", "Pendiente", "Capítulo", "Idea"],
    ph: {
      Avance: "Ej.: cerrado el capítulo de estado del arte",
      Pendiente: "Ej.: hacer las pruebas del controlador",
      Capítulo: "Nombre del capítulo de la memoria",
      Idea: "Algo que se te ocurra para el trabajo",
    },
  },
  trabajo: {
    label: "Trabajo", short: "Trabajo", color: "var(--c-trabajo)",
    kinds: ["Avance", "Aprendido", "Para el CV", "Pendiente", "Idea"],
    ph: {
      Avance: "Ej.: puesta en marcha del SCADA de la planta",
      Aprendido: "Ej.: plantillas de alarmas en System Platform",
      "Para el CV": "Un logro concreto con cifras: 40 pantallas migradas…",
      Pendiente: "Ej.: documentar los FB de bombas",
      Idea: "Algo que mejorar o automatizar",
    },
  },
  personal: {
    label: "Personal", short: "Personal", color: "var(--c-personal)",
    kinds: ["Diario", "Plan", "Logro", "Deseo", "Me gusta", "Idea", "Pendiente"],
    ph: {
      Diario: "Escribe lo que quieras sobre tu día…",
      Plan: "Ej.: cena con amigos, escapada a Vigo",
      Logro: "Algo de lo que estés orgulloso hoy, aunque sea pequeño",
      Deseo: "Ej.: sobrecamisa de lana gris",
      "Me gusta": "Una marca, un sitio, una canción, un estilo",
      Idea: "Algo que te gustaría probar",
      Pendiente: "Ej.: renovar el DNI",
    },
  },
  ajustes: { label: "Ajustes", short: "Ajustes", color: "var(--c-inicio)" },
};

export const CHECKABLE = new Set(["Pendiente", "Objetivo", "Quiero ver", "Plan", "Deseo"]);
export const MOODS = ["Fatal", "Regular", "Normal", "Bien", "Genial"];

// Colores para las secciones que crees tú
export const CUSTOM_COLORS = ["#0E7C86", "#B5891B", "#C2417A", "#4B6B2E", "#5B4FC4", "#8C5A3C"];

export const QUESTIONS = [
  "¿Qué ha sido lo mejor de hoy?", "¿Qué te ha costado hoy y cómo lo has llevado?", "¿Qué has aprendido esta semana?",
  "¿A quién te gustaría ver pronto?", "¿Qué harías mañana si no tuvieras obligaciones?", "¿De qué te sientes orgulloso últimamente?",
  "¿Qué echas de menos de Galicia?", "¿Qué te ha hecho reír hoy?", "¿Qué cambiarías de tu rutina?",
  "¿Qué peli o canción describe tu día?", "¿Qué te gustaría haber conseguido dentro de un año?",
  "¿Qué te ha dado energía hoy y qué te la ha quitado?", "¿Qué conversación de hoy recuerdas?",
  "¿Qué pequeño detalle te ha gustado hoy?", "¿Cómo te imaginas el día de la defensa del TFM?",
  "¿Qué te apetece estrenar este mes?", "¿Qué agradeces de esta semana?",
];
export const dayQuestion = () => {
  const n = new Date();
  const s = new Date(n.getFullYear(), 0, 0);
  return QUESTIONS[Math.floor((n - s) / 864e5) % QUESTIONS.length];
};
