import React, { useEffect, useState } from "react";
import { useData } from "../lib/data.jsx";
import { SECTIONS } from "./registry.js";
import { Hero, Panel, Composer, EntryList, Ring, IdeasPanel, Empty, ConfirmButton, Field } from "../ui.jsx";
import { daysUntil, fmtLong, parseIso } from "../lib/dates.js";
import { aiPromptFor } from "./common.js";

const S = SECTIONS.tfm;

function Chapter({ c }) {
  const { updateEntry, removeEntry } = useData();
  const [v, setV] = useState(Number(c.progress) || 0);
  useEffect(() => setV(Number(c.progress) || 0), [c.progress]);
  const commit = () => v !== (Number(c.progress) || 0) && updateEntry(c.id, { progress: v });
  return (
    <li className="chapter">
      <div className="chapter-top">
        <span className="chapter-name">{c.text}</span>
        <b className="chapter-pct">{v} %</b>
      </div>
      <div className="chapter-ctrl">
        <input
          type="range" min="0" max="100" step="5" value={v} aria-label={`Progreso de ${c.text}`}
          style={{ "--p": `${v}%` }}
          onChange={(e) => setV(Number(e.target.value))}
          onPointerUp={commit} onKeyUp={commit} onBlur={commit}
        />
        <ConfirmButton onConfirm={() => removeEntry(c.id)} label="Quitar" />
      </div>
    </li>
  );
}

export default function Tfm() {
  const { entries, settings, saveSettings } = useData();
  const mine = entries.filter((e) => e.section === "tfm");
  const chapters = mine.filter((e) => e.kind === "Capítulo").sort((a, b) => (a.order ?? a.createdAt) - (b.order ?? b.createdAt));
  const progress = chapters.length ? Math.round(chapters.reduce((a, c) => a + (Number(c.progress) || 0), 0) / chapters.length) : 0;
  const days = daysUntil(settings.tfmDeadline);
  const pending = mine.filter((e) => e.kind === "Pendiente" && !e.done).length;
  const weekAdv = mine.filter((e) => e.kind === "Avance" && Date.now() - e.createdAt < 7 * 864e5).length;
  const rest = mine.filter((e) => e.kind !== "Capítulo");

  const sentence =
    days === null
      ? "Pon la fecha de entrega y verás la cuenta atrás."
      : days > 0
      ? `Quedan ${days} días para entregar, el ${fmtLong(parseIso(settings.tfmDeadline))}.`
      : days === 0
      ? "Hoy es el día de la entrega. ¡A por ello!"
      : "La fecha de entrega ya ha pasado. Actualízala si ha cambiado.";

  return (
    <div className="page">
      <Hero color={S.color} title="TFM" aside={<Ring value={progress} max={100} label={`${progress} %`} sub="de la memoria" />}>
        <p>{sentence}</p>
        <p className="hero-sub">
          {weekAdv ? `Esta semana has apuntado ${weekAdv} ${weekAdv === 1 ? "avance" : "avances"}. ` : "Esta semana aún no has apuntado avances. "}
          {pending ? (pending === 1 ? "Te queda 1 tarea pendiente." : `Te quedan ${pending} tareas pendientes.`) : ""}
        </p>
      </Hero>
      <div className="split">
        <div className="col">
          <Composer
            section="tfm"
            kinds={S.kinds}
            ph={S.ph}
            buildEntry={(kind) => (kind === "Capítulo" ? { progress: 0, order: chapters.length } : {})}
          />
          <EntryList entries={rest} kinds={S.kinds.filter((k) => k !== "Capítulo")} empty="Apunta tu último avance o lo siguiente que tienes que hacer." />
        </div>
        <aside className="col side">
          <Panel title="Entrega">
            <Field label="Fecha de entrega">
              <input className="input" type="date" value={settings.tfmDeadline || ""} onChange={(e) => saveSettings({ tfmDeadline: e.target.value })} />
            </Field>
          </Panel>
          <Panel title="Capítulos de la memoria">
            {chapters.length ? (
              <ul className="chapters">{chapters.map((c) => <Chapter key={c.id} c={c} />)}</ul>
            ) : (
              <Empty>Añade los capítulos con el tipo «Capítulo» y ve moviendo la barra según avances.</Empty>
            )}
          </Panel>
          <IdeasPanel
            section="tfm"
            savedTexts={mine.map((e) => e.text || "")}
            aiPrompt={() => aiPromptFor(S.label, "Propón 4 siguientes pasos concretos y pequeños para avanzar en su TFM según sus avances, capítulos y pendientes.", mine)}
          />
        </aside>
      </div>
    </div>
  );
}
