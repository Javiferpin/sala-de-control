import React, { useState } from "react";
import { useData } from "../lib/data.jsx";
import { SECTIONS } from "./registry.js";
import { Hero, Panel, Segmented, Field, ConfirmButton } from "../ui.jsx";
import { weekDays, iso, DAYS, DAYS_LONG, MONTHS_LONG, today } from "../lib/dates.js";
import { weekGymStats } from "./common.js";
import { useGcal, useGcalEvents } from "../lib/gcal.jsx";

// Todo lo que hay en un día: eventos de la web, planes, entrenos hechos y eventos de Google
export function itemsForDay(day, i, events, entries, sectionList, gEvents = []) {
  const di = iso(day);
  const linked = new Set([...events, ...entries].map((x) => x.gcalId).filter(Boolean));
  const evs = events
    .filter((e) => (e.mode === "weekly" && e.weekday === i) || (e.mode === "date" && e.date === di))
    .map((e) => ({ id: e.id, kind: "event", title: e.title, time: e.time || "", weekly: e.mode === "weekly", gcalId: e.gcalId, color: colorOf(e.section, sectionList) }));
  const google = gEvents
    .filter((g) => g.days.includes(di) && !linked.has(g.seriesId) && !linked.has(g.id))
    .map((g) => ({ id: g.id, kind: "google", title: g.title, time: g.time, link: g.link, color: "var(--c-google)" }));
  const plans = entries
    .filter((p) => p.section === "personal" && p.kind === "Plan" && p.date === di)
    .map((p) => ({ id: p.id, kind: "plan", title: p.text, time: p.time || "", done: p.done, color: "var(--c-personal)" }));
  const done = entries
    .filter((s) => s.section === "gym" && s.kind === "Sesión" && s.date === di)
    .map((s) => ({ id: s.id, kind: "done", title: `${s.activity || "Gimnasio"}${s.km ? ` · ${s.km} km` : ""}`, time: "", color: "var(--c-gym)" }));
  const timed = [...evs, ...google, ...plans].sort((a, b) => (a.time || "99").localeCompare(b.time || "99"));
  return [...timed, ...done];
}

export const colorOf = (id, sectionList = []) => {
  if (SECTIONS[id]) return SECTIONS[id].color;
  const c = sectionList.find((s) => `s:${s.id}` === id);
  return c ? c.color : "var(--c-inicio)";
};

function rangeLabel(days) {
  const a = days[0], b = days[6];
  return a.getMonth() === b.getMonth()
    ? `Del ${a.getDate()} al ${b.getDate()} de ${MONTHS_LONG[b.getMonth()]}`
    : `Del ${a.getDate()} de ${MONTHS_LONG[a.getMonth()]} al ${b.getDate()} de ${MONTHS_LONG[b.getMonth()]}`;
}

export function GcalBar() {
  const g = useGcal();
  if (!g || g.status === "unavailable") return null;
  return (
    <div className="gcal-bar">
      <p>
        <span className="gcal-dot" aria-hidden="true" />
        {g.status === "on"
          ? "Conectado con tu Google Calendar."
          : g.status === "expired"
          ? "El permiso de Google Calendar ha caducado (dura una hora)."
          : "Conecta tu Google Calendar para ver aquí tus eventos y crear nuevos."}
        {g.error && <span className="error"> {g.error}</span>}
      </p>
      {g.status !== "on" && (
        <button type="button" className="btn primary" onClick={g.connect}>
          {g.status === "expired" ? "Reconectar" : "Conectar Google Calendar"}
        </button>
      )}
    </div>
  );
}

export default function Week() {
  const { events, entries, sections, settings, addEvent, removeEvent, notify } = useData();
  const g = useGcal();
  const [offset, setOffset] = useState(0);
  const [form, setForm] = useState({ title: "", section: "gym", mode: "weekly", weekday: 0, date: today(), time: "", toGoogle: true });
  const [busy, setBusy] = useState(false);
  const days = weekDays(offset);
  const from = iso(days[0]), to = iso(days[6]);
  const gcal = useGcalEvents(from, to);
  const t = today();
  const st = weekGymStats(entries, settings, { from, to });
  const all = days.map((d, i) => itemsForDay(d, i, events, entries, sections, gcal.events));
  const planned = all.flat().filter((x) => x.kind !== "done").length;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const gOn = g && g.status === "on";
  const options = [
    ...["gym", "cine", "tfm", "trabajo", "personal"].map((id) => ({ value: id, label: SECTIONS[id].short })),
    ...sections.map((s) => ({ value: `s:${s.id}`, label: s.name })),
  ];

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (!form.title.trim()) return notify("Escribe qué es.");
    const ev = { title: form.title.trim(), section: form.section, mode: form.mode, time: form.time || "" };
    if (form.mode === "weekly") ev.weekday = Number(form.weekday);
    else ev.date = form.date;
    setBusy(true);
    if (gOn && form.toGoogle) {
      try {
        ev.gcalId = await g.createEvent({ title: ev.title, date: ev.date, weekday: ev.weekday, time: ev.time });
      } catch (err) {
        notify(`${err.message} Lo guardo solo en la web.`);
      }
    }
    await addEvent(ev);
    setBusy(false);
    setForm((f) => ({ ...f, title: "", time: "" }));
  };

  const remove = async (x) => {
    if (x.gcalId && gOn) {
      try {
        await g.deleteEvent(x.gcalId);
      } catch (err) {
        notify(`No se ha podido borrar en Google: ${err.message}`);
      }
    }
    removeEvent(x.id);
  };

  return (
    <div className="page">
      <Hero color={SECTIONS.semana.color} title="Semana">
        <p>
          {rangeLabel(days)}. {planned ? `Tienes ${planned} ${planned === 1 ? "cosa planificada" : "cosas planificadas"}` : "No hay nada planificado"}
          {st.gym + st.run ? ` y ya has hecho ${st.gym + st.run} ${st.gym + st.run === 1 ? "entreno" : "entrenos"}.` : "."}
        </p>
      </Hero>

      <GcalBar />
      {gcal.error && <p className="error small">{gcal.error}</p>}

      <div className="week-nav">
        <button type="button" className="btn" onClick={() => setOffset(offset - 1)} aria-label="Semana anterior">Anterior</button>
        <button type="button" className="btn" onClick={() => setOffset(0)} disabled={offset === 0}>Esta semana</button>
        <button type="button" className="btn" onClick={() => setOffset(offset + 1)} aria-label="Semana siguiente">Siguiente</button>
        {gcal.loading && <span className="loading small muted">Leyendo Google Calendar</span>}
      </div>

      <div className="week">
        {days.map((d, i) => {
          const di = iso(d);
          return (
            <div key={di} className={`day ${di === t ? "is-today" : ""} ${di < t ? "is-past" : ""}`}>
              <div className="day-head">
                <span>{DAYS[i]}</span>
                <b>{d.getDate()}</b>
              </div>
              {all[i].length ? (
                all[i].map((x) => {
                  const meta =
                    x.kind === "done" ? "Hecho"
                    : x.kind === "plan" ? ["Plan", x.time].filter(Boolean).join(", ")
                    : x.kind === "google" ? ["Google", x.time].filter(Boolean).join(", ")
                    : [x.time, x.weekly ? "cada semana" : "", x.gcalId ? "en Google" : ""].filter(Boolean).join(", ");
                  const inner = (
                    <div>
                      {meta && <span className="item-meta">{meta}</span>}
                      <span className="item-title">{x.title}</span>
                    </div>
                  );
                  return (
                    <div key={x.kind + x.id} className={`item item-${x.kind} ${x.done ? "is-done" : ""}`} style={{ "--ic": x.color }}>
                      {x.kind === "google" && x.link ? <a href={x.link} target="_blank" rel="noreferrer">{inner}</a> : inner}
                      {x.kind === "event" && <ConfirmButton onConfirm={() => remove(x)} label="×" className="tiny" />}
                    </div>
                  );
                })
              ) : (
                <span className="day-free">Libre</span>
              )}
            </div>
          );
        })}
      </div>

      <Panel title="Añadir al calendario" className="add-event">
        <form onSubmit={submit} className="stack">
          <input className="input big" placeholder="Ej.: Gimnasio, pierna" aria-label="Qué" value={form.title} onChange={(e) => set("title", e.target.value)} />
          <div className="row wrap">
            <Field label="Sección">
              <select className="input" value={form.section} onChange={(e) => set("section", e.target.value)}>
                {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <div className="field">
              <span className="field-label">Cuándo</span>
              <Segmented label="Cuándo" options={[{ value: "weekly", label: "Cada semana" }, { value: "date", label: "Un día" }]} value={form.mode} onChange={(v) => set("mode", v)} />
            </div>
            {form.mode === "weekly" ? (
              <Field label="Día">
                <select className="input" value={form.weekday} onChange={(e) => set("weekday", e.target.value)}>
                  {DAYS_LONG.map((n, i) => <option key={n} value={i}>{n}</option>)}
                </select>
              </Field>
            ) : (
              <Field label="Fecha"><input className="input" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} /></Field>
            )}
            <Field label="Hora (opcional)"><input className="input" type="time" value={form.time} onChange={(e) => set("time", e.target.value)} /></Field>
          </div>
          {gOn && (
            <label className="check-row">
              <input type="checkbox" checked={form.toGoogle} onChange={(e) => set("toGoogle", e.target.checked)} />
              Añadir también a Google Calendar
            </label>
          )}
          <div><button className="btn primary" type="submit" disabled={busy}>{busy ? "Guardando…" : "Añadir"}</button></div>
        </form>
      </Panel>
    </div>
  );
}
