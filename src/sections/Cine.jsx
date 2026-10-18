import React from "react";
import { useData } from "../lib/data.jsx";
import { SECTIONS } from "./registry.js";
import { Hero, Panel, Composer, EntryList, Segmented, IdeasPanel } from "../ui.jsx";
import { fetchEstrenos, hasTmdb } from "../lib/ideas.js";
import { aiPromptFor } from "./common.js";

const S = SECTIONS.cine;
const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);

export default function Cine() {
  const { entries } = useData();
  const mine = entries.filter((e) => e.section === "cine");
  const year = new Date().getFullYear();
  const seen = mine.filter((e) => e.kind === "Vista");
  const seenYear = seen.filter((e) => new Date(e.createdAt).getFullYear() === year);
  const rated = seen.filter((e) => e.rating);
  const avg = rated.length ? rated.reduce((a, e) => a + Number(e.rating), 0) / rated.length : 0;
  const dist = [5, 4, 3, 2, 1].map((n) => ({ n, c: rated.filter((e) => Number(e.rating) === n).length }));
  const maxC = Math.max(1, ...dist.map((x) => x.c));
  const toSee = mine.filter((e) => e.kind === "Quiero ver" && !e.done);
  const favs = rated.filter((e) => Number(e.rating) === 5).slice(0, 6);

  return (
    <div className="page">
      <Hero
        color={S.color}
        title="Cine"
        aside={
          rated.length ? (
            <div className="hist" aria-label="Reparto de notas">
              {dist.map((x) => (
                <div key={x.n} className="hist-row">
                  <span>{x.n}★</span>
                  <i style={{ width: `${(x.c / maxC) * 100}%` }} />
                  <b>{x.c}</b>
                </div>
              ))}
            </div>
          ) : null
        }
      >
        <p>
          {seenYear.length
            ? `Has visto ${seenYear.length} ${seenYear.length === 1 ? "película" : "películas"} en ${year}${avg ? ` y les das una media de ${avg.toFixed(1).replace(".", ",")} estrellas` : ""}.`
            : "Apunta cada película que veas y tu nota. Así las recomendaciones aciertan más."}
          {toSee.length ? ` Tienes ${toSee.length} en tu lista para ver.` : ""}
        </p>
      </Hero>
      <div className="split">
        <div className="col">
          <Composer
            section="cine"
            kinds={S.kinds}
            ph={S.ph}
            renderFields={(kind, d, set) =>
              kind === "Vista" ? (
                <Segmented
                  label="Nota"
                  options={[1, 2, 3, 4, 5].map((n) => ({ value: n, label: "★".repeat(n) }))}
                  value={d.rating || 4}
                  onChange={(v) => set("rating", v)}
                />
              ) : null
            }
            buildEntry={(kind, d) => (kind === "Vista" ? { rating: d.rating || 4 } : {})}
          />
          <EntryList
            entries={mine}
            kinds={S.kinds}
            renderBody={(e) => (
              <p className="entry-text">
                {e.text} {e.rating ? <span className="stars" aria-label={`${e.rating} de 5`}>{stars(Number(e.rating))}</span> : null}
              </p>
            )}
            empty="Apunta la última película que viste y ponle nota."
          />
        </div>
        <aside className="col side">
          {favs.length > 0 && (
            <Panel title="Tus cinco estrellas">
              <ul className="kv">
                {favs.map((f) => <li key={f.id}><span>{f.text}</span><b className="stars">★★★★★</b></li>)}
              </ul>
            </Panel>
          )}
          <IdeasPanel
            section="cine"
            saveKind="Quiero ver"
            saveLabel="Añadir a quiero ver"
            savedTexts={mine.map((e) => e.text || "")}
            extraTab={hasTmdb() ? { label: "En cines", load: () => fetchEstrenos("now_playing") } : null}
            aiPrompt={() =>
              aiPromptFor(S.label, "Recomienda 4 películas que probablemente le gusten según lo que ha visto y sus notas. En title pon el título en español y el año; en detail, el director y por qué encaja.", mine)
            }
          />
        </aside>
      </div>
    </div>
  );
}
