import { iso, mondayOf, addDays, num, parseMin } from "../lib/dates.js";

export const PROFILE =
  "Perfil: ingeniero de automatización en Madrid que trabaja con AVEVA System Platform y Siemens TIA Portal. " +
  "Está terminando el Máster en Robótica y Automática de la UPM (solo le queda el TFM). Muy organizado con sus tiempos. " +
  "Va al gimnasio 3 días por semana y corre 1 o 2. Le gustan la moda y el cine. Quiere volver a trabajar a Galicia, de donde es.";

export function entryLine(e) {
  let t = `[${e.kind}${e.done ? ", hecho" : ""}] ${e.text || ""}`;
  if (e.rating) t += ` (nota ${e.rating}/5)`;
  if (e.mood) t += ` (ánimo ${e.mood}/5)`;
  if (e.sets) t += " " + e.sets.map((s) => `${s.ex} ${s.s || ""}x${s.r || ""} ${s.kg || ""}kg`).join(", ");
  if (e.km) t += ` ${e.km} km`;
  return t.slice(0, 300);
}

export function aiPromptFor(sectionLabel, task, list) {
  const mine = list.slice(0, 60).map((e) => `- ${entryLine(e)}`).join("\n") || "(todavía no ha apuntado nada)";
  return `${PROFILE}\n\nSección de su web personal: ${sectionLabel}.\nLo que ha apuntado:\n${mine}\n\nTarea: ${task}\nNo repitas nada que ya tenga apuntado. Escribe en español de España, tono cercano.\nResponde SOLO con un array JSON de 4 objetos {"title": string, "detail": string}; detail de máximo 25 palabras explicando por qué encaja con él.`;
}

export const thisWeek = () => {
  const m = mondayOf(new Date());
  return { from: iso(m), to: iso(addDays(m, 6)) };
};

export const sessions = (entries) => entries.filter((e) => e.section === "gym" && e.kind === "Sesión");

export function weekGymStats(entries, settings, range = thisWeek()) {
  const ses = sessions(entries).filter((s) => s.date >= range.from && s.date <= range.to);
  return {
    gym: ses.filter((s) => (s.activity || "Gimnasio") === "Gimnasio").length,
    run: ses.filter((s) => s.activity === "Correr").length,
    km: Math.round(ses.reduce((a, s) => a + (Number(s.km) || 0), 0) * 10) / 10,
    gymGoal: Number(settings.gymGoal) || 3,
    runGoal: Number(settings.runGoal) || 2,
  };
}

export function bestLifts(entries) {
  const m = new Map();
  sessions(entries).forEach((s) =>
    (s.sets || []).forEach((r) => {
      const kg = num(r.kg);
      if (kg === null) return;
      const k = String(r.ex).trim().toLowerCase();
      const cur = m.get(k);
      if (!cur || kg > cur.kg) m.set(k, { ex: String(r.ex).trim(), kg, date: s.date });
    })
  );
  return [...m.values()].sort((a, b) => b.kg - a.kg);
}

export function liftHistory(entries, name) {
  const k = name.trim().toLowerCase();
  const byDate = new Map();
  sessions(entries).forEach((s) =>
    (s.sets || []).forEach((r) => {
      if (String(r.ex).trim().toLowerCase() !== k) return;
      const kg = num(r.kg);
      if (kg === null || !s.date) return;
      byDate.set(s.date, Math.max(byDate.get(s.date) || 0, kg));
    })
  );
  return [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([d, y]) => ({ x: new Date(d + "T12:00").getTime(), y }));
}

export function lastSetFor(entries, name) {
  const k = String(name || "").trim().toLowerCase();
  if (!k) return null;
  const ses = sessions(entries).filter((e) => Array.isArray(e.sets)).sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  for (const s of ses) {
    const r = s.sets.find((x) => String(x.ex).trim().toLowerCase() === k);
    if (r) return { ...r, date: s.date };
  }
  return null;
}

export const runPace = (e) => {
  const min = parseMin(e.time);
  return min && e.km ? min / e.km : null;
};

export function sessionVolume(sets = []) {
  let vol = 0;
  sets.forEach((r) => {
    const kg = num(r.kg), s = num(r.s) || 1;
    const reps = String(r.r || "").split(/[/,\- ]+/).map(num).filter((x) => x !== null);
    if (kg !== null && reps.length) vol += kg * (reps.length > 1 ? reps.reduce((a, b) => a + b, 0) : reps[0] * s);
  });
  return vol;
}

export const setLabel = (r) => `${r.s ? `${r.s} × ` : ""}${r.r || "–"}`;
