import React, { useState } from "react";
import { useData } from "../lib/data.jsx";
import { SECTIONS, CUSTOM_COLORS } from "./registry.js";
import { Hero, Panel, Field, ConfirmButton, Empty } from "../ui.jsx";
import { AI_KEY, getAiKey, hasTmdb } from "../lib/ideas.js";
import { useGcal } from "../lib/gcal.jsx";

export default function Settings({ go }) {
  const { store, user, settings, saveSettings, sections, entries, events, addSection, removeSection, notify } = useData();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [kinds, setKinds] = useState("Pendiente, Idea, Nota");
  const [color, setColor] = useState(CUSTOM_COLORS[0]);
  const [aiKey, setAiKey] = useState(getAiKey());
  const g = useGcal();

  const create = (e) => {
    e.preventDefault();
    if (!name.trim()) return notify("Ponle un nombre a la sección.");
    const ks = kinds.split(",").map((k) => k.trim()).filter(Boolean).slice(0, 8);
    addSection({ name: name.trim(), description: desc.trim(), color, kinds: ks.length ? ks : ["Nota"] });
    setName(""); setDesc("");
  };

  const saveKey = () => {
    try {
      if (aiKey.trim()) localStorage.setItem(AI_KEY, aiKey.trim());
      else localStorage.removeItem(AI_KEY);
      notify(aiKey.trim() ? "Clave guardada en este navegador" : "Clave borrada");
    } catch {
      notify("Este navegador no permite guardar la clave.");
    }
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ exportado: new Date().toISOString(), entries, events, sections, settings }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `sala-de-control-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  return (
    <div className="page">
      <Hero color={SECTIONS.ajustes.color} title="Ajustes">
        <p>Tus objetivos, tus secciones propias y las opciones de la web.</p>
      </Hero>
      <div className="settings-grid">
        <Panel title="Objetivos de la semana">
          <div className="row wrap">
            <Field label="Días de gimnasio">
              <input className="input narrow" type="number" min="0" max="7" value={settings.gymGoal ?? 3} onChange={(e) => saveSettings({ gymGoal: Number(e.target.value) })} />
            </Field>
            <Field label="Días de correr">
              <input className="input narrow" type="number" min="0" max="7" value={settings.runGoal ?? 2} onChange={(e) => saveSettings({ runGoal: Number(e.target.value) })} />
            </Field>
            <Field label="Entrega del TFM">
              <input className="input" type="date" value={settings.tfmDeadline || ""} onChange={(e) => saveSettings({ tfmDeadline: e.target.value })} />
            </Field>
          </div>
        </Panel>

        <Panel title="Secciones propias" className="span-2">
          <p className="muted">Crea secciones nuevas cuando quieras: lecturas, viajes, recetas, finanzas… Aparecen en el menú con su color.</p>
          {sections.length ? (
            <ul className="kv">
              {sections.map((s) => (
                <li key={s.id}>
                  <button type="button" className="link-row" onClick={() => go(`s:${s.id}`)}>
                    <i className="swatch" style={{ background: s.color }} /> {s.name}
                    <span className="muted small"> · {(s.kinds || []).join(", ")}</span>
                  </button>
                  <ConfirmButton onConfirm={() => removeSection(s.id)} />
                </li>
              ))}
            </ul>
          ) : <Empty>Aún no has creado ninguna.</Empty>}
          <form onSubmit={create} className="stack new-section">
            <div className="row wrap">
              <Field label="Nombre" grow><input className="input" placeholder="Ej.: Lecturas" value={name} onChange={(e) => setName(e.target.value)} /></Field>
              <Field label="Para qué es (opcional)" grow><input className="input" placeholder="Ej.: libros que leo y quiero leer" value={desc} onChange={(e) => setDesc(e.target.value)} /></Field>
            </div>
            <Field label="Tipos de entrada, separados por comas" hint="«Pendiente» y «Plan» se pueden marcar como hechos">
              <input className="input" value={kinds} onChange={(e) => setKinds(e.target.value)} />
            </Field>
            <div className="field">
              <span className="field-label">Color</span>
              <div className="swatches" role="radiogroup" aria-label="Color">
                {CUSTOM_COLORS.map((c) => (
                  <button key={c} type="button" role="radio" aria-checked={color === c} aria-label={c} className="swatch-btn" style={{ background: c }} onClick={() => setColor(c)} />
                ))}
              </div>
            </div>
            <div><button className="btn primary" type="submit">Crear sección</button></div>
          </form>
        </Panel>

        <Panel title="Google Calendar">
          {!g || g.status === "unavailable" ? (
            <p className="muted small">
              {store && store.mode === "demo"
                ? "Disponible cuando conectes Firebase y pongas tu googleClientId en src/config.js (mira la guía)."
                : "Falta el googleClientId en src/config.js (mira la guía)."}
            </p>
          ) : (
            <>
              <p className="muted small">
                {g.status === "on"
                  ? "Conectado. Ves tus eventos de Google en la semana y en el inicio, y lo que añadas aquí puede crearse también en Google."
                  : "Conéctalo para ver tus eventos y crear nuevos. El permiso de Google dura una hora; luego basta con pulsar Reconectar."}
              </p>
              {g.error && <p className="error small">{g.error}</p>}
              <div className="row wrap">
                {g.status === "on" ? (
                  <button type="button" className="btn" onClick={g.disconnect}>Desconectar</button>
                ) : (
                  <button type="button" className="btn primary" onClick={g.connect}>{g.status === "expired" ? "Reconectar" : "Conectar Google Calendar"}</button>
                )}
              </div>
              <p className="muted small">En el iPhone: Ajustes → Calendario → Cuentas → Añadir cuenta → Google. Así lo que crees aquí aparece también en el calendario del iPhone.</p>
            </>
          )}
        </Panel>

        <Panel title="Ideas con IA (opcional)">
          <p className="muted small">
            Con tu propia clave de la API de Claude, cada sección te propone ideas basadas en lo que apuntas. Se paga por uso (con el modelo
            más ligero son céntimos al mes). La clave se guarda solo en este navegador. Créala en console.anthropic.com.
          </p>
          <Field label="Clave de la API">
            <input className="input" type="password" autoComplete="off" placeholder="sk-ant-…" value={aiKey} onChange={(e) => setAiKey(e.target.value)} />
          </Field>
          <div><button type="button" className="btn" onClick={saveKey}>{aiKey.trim() ? "Guardar clave" : "Borrar clave"}</button></div>
        </Panel>

        <Panel title="Estrenos de cine">
          <p className="muted small">
            {hasTmdb()
              ? "Conectado con TMDB: en Cine verás las películas que están en cines en España."
              : "Opcional y gratis: crea una clave en themoviedb.org y pégala en src/config.js para ver qué hay en cines en España."}
          </p>
        </Panel>

        <Panel title="Tus datos">
          <p className="muted small">
            {store && store.mode === "demo"
              ? "Estás en modo demo: los datos se guardan solo en este navegador. Conecta Firebase (mira la guía) para tenerlos en todos tus dispositivos."
              : `Guardados en tu Firebase${user && user.email ? `, con la cuenta ${user.email}` : ""}.`}
          </p>
          <div className="row wrap">
            <button type="button" className="btn" onClick={exportData}>Descargar copia (JSON)</button>
            {store && store.mode === "demo" ? (
              <>
                <button type="button" className="btn" onClick={() => store.resetDemo()}>Volver a los datos de ejemplo</button>
                <ConfirmButton onConfirm={() => store.clearDemo()} label="Empezar vacío" />
              </>
            ) : (
              <button type="button" className="btn" onClick={() => store && store.signOut()}>Cerrar sesión</button>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
