import React from "react";
import { useData } from "../lib/data.jsx";
import { SECTIONS } from "./registry.js";
import { Hero, Panel, Composer, EntryList, IdeasPanel, Empty } from "../ui.jsx";
import { aiPromptFor } from "./common.js";

const S = SECTIONS.trabajo;

export default function Work() {
  const { entries, notify } = useData();
  const mine = entries.filter((e) => e.section === "trabajo");
  const month = new Date().getMonth(), year = new Date().getFullYear();
  const inMonth = (e) => new Date(e.createdAt).getMonth() === month && new Date(e.createdAt).getFullYear() === year;
  const adv = mine.filter((e) => e.kind === "Avance" && inMonth(e)).length;
  const learned = mine.filter((e) => e.kind === "Aprendido" && inMonth(e)).length;
  const cv = mine.filter((e) => e.kind === "Para el CV").sort((a, b) => b.createdAt - a.createdAt);

  const copyCv = async () => {
    const txt = cv.map((e) => `• ${e.text}`).join("\n");
    try {
      await navigator.clipboard.writeText(txt);
      notify("Copiado. Pégalo en tu CV o en LinkedIn.");
    } catch {
      notify("No se ha podido copiar. Selecciona el texto a mano.");
    }
  };

  return (
    <div className="page">
      <Hero color={S.color} title="Trabajo">
        <p>
          {adv || learned
            ? `Este mes has apuntado ${adv} ${adv === 1 ? "avance" : "avances"} y ${learned} ${learned === 1 ? "cosa aprendida" : "cosas aprendidas"}.`
            : "Apunta lo que avanzas y lo que aprendes. En unos meses tendrás un historial muy útil."}
          {cv.length ? ` Tienes ${cv.length} ${cv.length === 1 ? "logro listo" : "logros listos"} para el CV.` : ""}
        </p>
      </Hero>
      <div className="split">
        <div className="col">
          <Composer section="trabajo" kinds={S.kinds} ph={S.ph} />
          <EntryList entries={mine} kinds={S.kinds} empty="Apunta en qué estás trabajando o algo que hayas aprendido hoy." />
        </div>
        <aside className="col side">
          <Panel title="Para el CV" action={cv.length ? <button type="button" className="btn-ghost" onClick={copyCv}>Copiar todo</button> : null}>
            {cv.length ? (
              <ul className="cv-list">{cv.map((e) => <li key={e.id}>{e.text}</li>)}</ul>
            ) : (
              <Empty>Usa el tipo «Para el CV» con logros concretos y con cifras. Te servirán para buscar trabajo en Galicia.</Empty>
            )}
          </Panel>
          <IdeasPanel
            section="trabajo"
            savedTexts={mine.map((e) => e.text || "")}
            aiPrompt={() => aiPromptFor(S.label, "Sugiere 4 cosas concretas que aprender, probar o mejorar en su trabajo de automatización (TIA Portal, System Platform, SCADA, robótica, OT), pensando también en su perfil para el mercado gallego.", mine)}
          />
        </aside>
      </div>
    </div>
  );
}
