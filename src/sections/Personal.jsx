import React from "react";
import { useData } from "../lib/data.jsx";
import { SECTIONS, MOODS, dayQuestion } from "./registry.js";
import { Hero, Panel, Composer, EntryList, Segmented, Field, LineChart, IdeasPanel, Empty } from "../ui.jsx";
import { iso, addDays, today, parseIso, DAYS, wd, fmtShort, num, fmtNum } from "../lib/dates.js";
import { aiPromptFor } from "./common.js";
import { useGcal } from "../lib/gcal.jsx";

const S = SECTIONS.personal;

export function diaryStreak(entries) {
  const days = new Set(entries.filter((e) => e.section === "personal" && e.kind === "Diario").map((e) => iso(new Date(e.createdAt))));
  let c = new Date(), n = 0;
  if (!days.has(iso(c))) c = addDays(c, -1);
  while (days.has(iso(c))) { n++; c = addDays(c, -1); }
  return n;
}

export function weekMood(entries) {
  const wk = entries.filter((e) => e.section === "personal" && e.kind === "Diario" && e.mood && Date.now() - e.createdAt < 7 * 864e5);
  return wk.length ? wk.reduce((a, e) => a + e.mood, 0) / wk.length : 0;
}

function Body({ e }) {
  if (e.kind === "Diario")
    return (
      <>
        {e.q && <p className="entry-q">{e.q}</p>}
        <p className="entry-text long">{e.text}</p>
        {e.mood ? <span className={`mood-tag m${e.mood}`}>{MOODS[e.mood - 1]}</span> : null}
      </>
    );
  if (e.kind === "Plan" && e.date) return <p className="entry-text">{e.text} <span className="muted">· {DAYS[wd(parseIso(e.date))].toLowerCase()} {fmtShort(parseIso(e.date))}{e.time ? `, ${e.time}` : ""}{e.gcalId ? " · en Google" : ""}</span></p>;
  if (e.kind === "Deseo" && e.price) return <p className="entry-text">{e.text} <span className="muted">· unos {fmtNum(e.price)} €</span></p>;
  return <p className="entry-text">{e.text}</p>;
}

export default function Personal() {
  const { entries, removeEntry, notify } = useData();
  const g = useGcal();
  const gOn = g && g.status === "on";
  const mine = entries.filter((e) => e.section === "personal");
  const streak = diaryStreak(entries);
  const mood = weekMood(entries);
  const t = today();
  const plans = mine.filter((e) => e.kind === "Plan" && !e.done && e.date && e.date >= t).sort((a, b) => a.date.localeCompare(b.date));
  const loose = mine.filter((e) => e.kind === "Plan" && !e.done && !e.date).length;
  const wishes = mine.filter((e) => e.kind === "Deseo" && !e.done);
  const wishTotal = wishes.reduce((a, e) => a + (Number(e.price) || 0), 0);
  const moodPts = mine
    .filter((e) => e.kind === "Diario" && e.mood && Date.now() - e.createdAt < 30 * 864e5)
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((e) => ({ x: e.createdAt, y: e.mood }));

  return (
    <div className="page">
      <Hero color={S.color} title="Personal">
        <p>
          {streak ? `Llevas ${streak} ${streak === 1 ? "día" : "días"} seguidos escribiendo en el diario.` : "Hoy es buen día para empezar el diario."}
          {mood ? ` Esta semana tu ánimo medio es «${MOODS[Math.round(mood) - 1].toLowerCase()}».` : ""}
        </p>
        <p className="hero-sub">Pregunta de hoy: {dayQuestion()}</p>
      </Hero>
      <div className="split">
        <div className="col">
          <Composer
            section="personal"
            kinds={S.kinds}
            ph={S.ph}
            textareaKinds={["Diario"]}
            beforeText={(k) => (k === "Diario" ? <p className="prompt-q">{dayQuestion()}</p> : null)}
            submitLabel={(k) => (k === "Diario" ? "Guardar en el diario" : "Guardar")}
            renderFields={(kind, d, set) => {
              if (kind === "Diario")
                return (
                  <div className="row">
                    <span className="field-label">¿Cómo ha ido el día?</span>
                    <Segmented label="Ánimo" options={MOODS.map((m, i) => ({ value: i + 1, label: m }))} value={d.mood || 0} onChange={(v) => set("mood", d.mood === v ? 0 : v)} />
                  </div>
                );
              if (kind === "Plan")
                return (
                  <>
                    <div className="row">
                      <Field label="Fecha (opcional)" hint="Con fecha, aparece en tu semana">
                        <input className="input" type="date" value={d.date || ""} onChange={(e) => set("date", e.target.value)} />
                      </Field>
                      {d.date && (
                        <Field label="Hora (opcional)">
                          <input className="input" type="time" value={d.time || ""} onChange={(e) => set("time", e.target.value)} />
                        </Field>
                      )}
                    </div>
                    {gOn && d.date && (
                      <label className="check-row">
                        <input type="checkbox" checked={d.toGoogle !== false} onChange={(e) => set("toGoogle", e.target.checked)} />
                        Añadir también a Google Calendar
                      </label>
                    )}
                  </>
                );
              if (kind === "Deseo")
                return (
                  <div className="row">
                    <Field label="Precio aproximado (€)">
                      <input className="input narrow" inputMode="decimal" value={d.price || ""} onChange={(e) => set("price", e.target.value)} />
                    </Field>
                  </div>
                );
              return null;
            }}
            buildEntry={async (kind, d) => {
              if (kind === "Diario") return { q: dayQuestion(), ...(d.mood ? { mood: d.mood } : {}) };
              if (kind === "Plan") {
                if (!d.date) return {};
                const out = { date: d.date, ...(d.time ? { time: d.time } : {}) };
                if (gOn && d.toGoogle !== false && (d.text || "").trim()) {
                  try {
                    out.gcalId = await g.createEvent({ title: d.text.trim(), date: d.date, time: d.time || "" });
                  } catch (err) {
                    notify(`${err.message} Lo guardo solo en la web.`);
                  }
                }
                return out;
              }
              if (kind === "Deseo") { const p = num(d.price); return p ? { price: p } : {}; }
              return {};
            }}
          />
          <EntryList
            entries={mine}
            kinds={S.kinds}
            renderBody={(e) => <Body e={e} />}
            onRemove={async (e) => {
              if (e.gcalId && gOn) {
                try { await g.deleteEvent(e.gcalId); } catch (err) { notify(`No se ha podido borrar en Google: ${err.message}`); }
              }
              removeEntry(e.id);
            }} empty="Escribe la primera entrada del diario o apunta un plan." />
        </div>
        <aside className="col side">
          <Panel title="Próximos planes">
            {plans.length ? (
              <ul className="kv">
                {plans.slice(0, 6).map((p) => (
                  <li key={p.id}><span>{p.text}</span><b>{DAYS[wd(parseIso(p.date))]} {fmtShort(parseIso(p.date))}</b></li>
                ))}
              </ul>
            ) : <Empty>Los planes con fecha aparecen aquí y en tu semana.</Empty>}
            {loose > 0 && <p className="muted small">Y {loose} {loose === 1 ? "plan" : "planes"} sin fecha esperando hueco.</p>}
          </Panel>
          <Panel title="Ánimo del último mes">
            {moodPts.length >= 2 ? (
              <LineChart points={moodPts} format={(v) => MOODS[Math.max(0, Math.min(4, Math.round(v) - 1))]} />
            ) : <Empty>Marca cómo ha ido el día al escribir en el diario y verás la evolución.</Empty>}
          </Panel>
          {wishes.length > 0 && (
            <Panel title="Lista de deseos">
              <ul className="kv">
                {wishes.slice(0, 6).map((w) => <li key={w.id}><span>{w.text}</span><b>{w.price ? `${fmtNum(w.price)} €` : "—"}</b></li>)}
              </ul>
              {wishTotal > 0 && <p className="muted small">Total: {fmtNum(wishTotal)} €</p>}
            </Panel>
          )}
          <IdeasPanel
            section="personal"
            savedTexts={mine.map((e) => e.text || "")}
            aiPrompt={() =>
              aiPromptFor(S.label, "Sugiere 4 ideas personales variadas: un plan de fin de semana (en Madrid o escapada, a veces a Galicia), una idea de moda que encaje con sus gustos y deseos, un pequeño reto para el mes y una idea que le sorprenda.", mine)
            }
          />
        </aside>
      </div>
    </div>
  );
}
