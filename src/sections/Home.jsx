import React, { useMemo, useState } from "react";
import { useData } from "../lib/data.jsx";
import { SECTIONS, MOODS, dayQuestion } from "./registry.js";
import { Hero, Panel, Meter, Heatmap, Segmented, Empty } from "../ui.jsx";
import { greeting, fmtLong, iso, wd, daysUntil, relDate } from "../lib/dates.js";
import { weekGymStats } from "./common.js";
import { itemsForDay, colorOf } from "./Week.jsx";
import { diaryStreak } from "./Personal.jsx";
import { useGcalEvents } from "../lib/gcal.jsx";
import { GcalBar } from "./Week.jsx";

export default function Home({ go }) {
  const { user, entries, events, sections, settings, addEntry } = useData();
  const now = new Date();
  const todayIso = iso(now);
  const gcal = useGcalEvents(todayIso, todayIso);
  const todays = itemsForDay(now, wd(now), events, entries, sections, gcal.events);
  const st = weekGymStats(entries, settings);
  const days = daysUntil(settings.tfmDeadline);
  const chapters = entries.filter((e) => e.section === "tfm" && e.kind === "Capítulo");
  const tfmPct = chapters.length ? Math.round(chapters.reduce((a, c) => a + (Number(c.progress) || 0), 0) / chapters.length) : null;
  const pending = entries.filter((e) => ["Pendiente"].includes(e.kind) && !e.done).length;
  const streak = diaryStreak(entries);
  const wroteToday = entries.some((e) => e.section === "personal" && e.kind === "Diario" && iso(new Date(e.createdAt)) === iso(now));
  const [diary, setDiary] = useState("");
  const [mood, setMood] = useState(0);

  const counts = useMemo(() => {
    const m = new Map();
    entries.forEach((e) => {
      const k = e.kind === "Sesión" && e.date ? e.date : iso(new Date(e.createdAt));
      m.set(k, (m.get(k) || 0) + 1);
    });
    return m;
  }, [entries]);
  const latest = [...entries].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6);
  const name = (user && user.name ? user.name.split(" ")[0] : "").trim();

  const saveDiary = (e) => {
    e.preventDefault();
    if (!diary.trim()) return;
    addEntry({ section: "personal", kind: "Diario", text: diary.trim(), q: dayQuestion(), ...(mood ? { mood } : {}) }, "Guardado en el diario");
    setDiary("");
    setMood(0);
  };

  const sectionName = (id) => (SECTIONS[id] ? SECTIONS[id].short : (sections.find((s) => `s:${s.id}` === id) || {}).name || "");

  return (
    <div className="page">
      <Hero color={SECTIONS.inicio.color} title={`${greeting()}${name ? `, ${name}` : ""}`}>
        <p>
          Hoy es {fmtLong(now)}.{" "}
          {todays.length
            ? `Tienes ${todays.filter((x) => x.kind !== "done").map((x) => (x.time ? `${x.title} a las ${x.time}` : x.title)).join(", ") || "el día libre"}.`
            : "No tienes nada planificado: día libre."}
        </p>
      </Hero>

      <GcalBar />

      <div className="home-grid">
        <Panel title="Tu semana" className="span-2">
          <div className="meters">
            <Meter label="Gimnasio" value={st.gym} max={st.gymGoal} unit="días" color="var(--c-gym)" />
            <Meter label="Correr" value={st.run} max={st.runGoal} unit="días" color="var(--c-gym)" note={st.km ? `${String(st.km).replace(".", ",")} km esta semana` : null} />
            <Meter
              label="TFM"
              value={days === null ? "—" : Math.max(days, 0)}
              unit={days === null ? "sin fecha" : "días para entregar"}
              note={tfmPct !== null ? `Memoria al ${tfmPct} %` : null}
            />
            <Meter label="Pendientes" value={pending} unit="abiertos" />
          </div>
          <button type="button" className="btn-ghost" onClick={() => go("semana")}>Ver la semana entera</button>
        </Panel>

        <Panel title="Diario" className="diary-card">
          {wroteToday ? (
            <p className="muted">Hoy ya has escrito. {streak > 1 ? `Llevas ${streak} días seguidos.` : ""}</p>
          ) : (
            <form onSubmit={saveDiary} className="stack">
              <p className="prompt-q">{dayQuestion()}</p>
              <textarea className="input area short" aria-label="Escribe en el diario" placeholder="Unas líneas bastan…" value={diary} onChange={(e) => setDiary(e.target.value)} />
              <Segmented label="Ánimo" options={MOODS.map((m, i) => ({ value: i + 1, label: m }))} value={mood} onChange={(v) => setMood(mood === v ? 0 : v)} />
              <div><button className="btn primary" type="submit" disabled={!diary.trim()}>Guardar en el diario</button></div>
            </form>
          )}
        </Panel>

        <Panel title="Actividad de las últimas semanas" className="span-2">
          <Heatmap counts={counts} weeks={18} />
        </Panel>

        <Panel title="Lo último que has apuntado">
          {latest.length ? (
            <ul className="feed">
              {latest.map((e) => (
                <li key={e.id}>
                  <button type="button" className="feed-btn" onClick={() => go(e.section)} style={{ "--ic": colorOf(e.section, sections) }}>
                    <span className="feed-sec">{sectionName(e.section)} · {e.kind.toLowerCase()} · {relDate(e.createdAt)}</span>
                    <span className="feed-text">{e.kind === "Sesión" ? `${e.activity || "Gimnasio"}${e.text ? `: ${e.text}` : ""}` : e.text}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Aquí verás lo último que apuntes en cualquier sección.</Empty>
          )}
        </Panel>
      </div>
    </div>
  );
}
