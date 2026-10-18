import React from "react";
import { useData } from "../lib/data.jsx";
import { Hero, Composer, EntryList, IdeasPanel, Empty } from "../ui.jsx";
import { getAiKey } from "../lib/ideas.js";
import { aiPromptFor } from "./common.js";

// Pantalla para las secciones que creas tú desde Ajustes
export default function Custom({ id }) {
  const { sections, entries } = useData();
  const sec = sections.find((s) => s.id === id);
  if (!sec) return <div className="page"><Empty>Esta sección ya no existe.</Empty></div>;
  const key = `s:${sec.id}`;
  const kinds = sec.kinds && sec.kinds.length ? sec.kinds : ["Nota"];
  const mine = entries.filter((e) => e.section === key);
  const doneCount = mine.filter((e) => e.done).length;

  return (
    <div className="page">
      <Hero color={sec.color} title={sec.name} ink="#ffffff">
        <p>
          {mine.length
            ? `Tienes ${mine.length} ${mine.length === 1 ? "cosa apuntada" : "cosas apuntadas"}${doneCount ? `, ${doneCount} ya hechas` : ""}.`
            : sec.description || "Tu sección nueva. Apunta lo primero."}
        </p>
      </Hero>
      <div className="split">
        <div className="col">
          <Composer section={key} kinds={kinds} ph={{}} />
          <EntryList entries={mine} kinds={kinds} />
        </div>
        <aside className="col side">
          {getAiKey() ? (
            <IdeasPanel
              section={key}
              savedTexts={mine.map((e) => e.text || "")}
              saveKind={kinds.includes("Idea") ? "Idea" : kinds[0]}
              aiPrompt={() => aiPromptFor(sec.name, `Sugiere 4 ideas nuevas y concretas relacionadas con su sección «${sec.name}»${sec.description ? ` (${sec.description})` : ""}, según lo que ha apuntado.`, mine)}
            />
          ) : (
            <Empty>Si activas la IA en Ajustes, aquí te propondrá ideas para esta sección.</Empty>
          )}
        </aside>
      </div>
    </div>
  );
}
