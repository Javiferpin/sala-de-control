import React, { useMemo, useState } from "react";
import { useData } from "../lib/data.jsx";
import { SECTIONS } from "./registry.js";
import { Hero, Panel, Composer, EntryList, Segmented, Field, Ring, LineChart, IdeasPanel, Empty } from "../ui.jsx";
import { today, fmtShort, parseIso, paceStr, parseMin, num, fmtNum, MONTHS } from "../lib/dates.js";
import { weekGymStats, bestLifts, liftHistory, lastSetFor, sessions, runPace, sessionVolume, setLabel, aiPromptFor } from "./common.js";

const S = SECTIONS.gym;
const emptyRow = () => ({ ex: "", s: "", r: "", kg: "" });

function SetsEditor({ rows, onChange, entries }) {
  const names = useMemo(
    () => [...new Set(sessions(entries).flatMap((e) => (e.sets || []).map((r) => String(r.ex).trim())).filter(Boolean))].sort(),
    [entries]
  );
  const setRow = (i, k, v) => onChange(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  return (
    <div className="sets">
      <div className="sets-head" aria-hidden="true">
        <span>Ejercicio</span><span>Series</span><span>Reps</span><span>Kg</span><span />
      </div>
      {rows.map((r, i) => {
        const last = lastSetFor(entries, r.ex);
        return (
          <div className="sets-row" key={i}>
            <input className="input" list="ex-list" placeholder={i === 0 ? "Press banca" : "Ejercicio"} aria-label={`Ejercicio ${i + 1}`} value={r.ex} onChange={(e) => setRow(i, "ex", e.target.value)} />
            <input className="input" inputMode="numeric" placeholder="4" aria-label="Series" value={r.s} onChange={(e) => setRow(i, "s", e.target.value)} />
            <input className="input" inputMode="numeric" placeholder="10" aria-label="Repeticiones" value={r.r} onChange={(e) => setRow(i, "r", e.target.value)} />
            <input className="input" inputMode="decimal" placeholder="60" aria-label="Kilos" value={r.kg} onChange={(e) => setRow(i, "kg", e.target.value)} />
            <button type="button" className="btn-ghost icon" aria-label="Quitar ejercicio" onClick={() => onChange(rows.length > 1 ? rows.filter((_, j) => j !== i) : [emptyRow()])}>×</button>
            {last && (
              <span className="sets-hint">
                Última vez, {fmtShort(parseIso(last.date))}: {setLabel(last)}{last.kg !== "" && last.kg != null ? ` con ${last.kg} kg` : ""}
                {last.kg !== "" && last.kg != null && !r.kg && (
                  <button type="button" className="link" onClick={() => onChange(rows.map((x, j) => (j === i ? { ...x, s: x.s || String(last.s || ""), r: x.r || last.r, kg: String(last.kg) } : x)))}>
                    Repetir
                  </button>
                )}
              </span>
            )}
          </div>
        );
      })}
      <datalist id="ex-list">{names.map((n) => <option key={n} value={n} />)}</datalist>
      <div className="sets-foot">
        <button type="button" className="btn" onClick={() => onChange([...rows, emptyRow()])}>Añadir ejercicio</button>
        <span className="muted small">En reps puedes poner una por serie: 12/10/8</span>
      </div>
    </div>
  );
}

function SessionBody({ e }) {
  if (e.kind !== "Sesión") return <p className="entry-text">{e.text}</p>;
  const pace = runPace(e);
  const vol = sessionVolume(e.sets);
  return (
    <>
      <p className="entry-text">
        <b>{e.activity || "Gimnasio"}</b>
        {e.text ? ` · ${e.text}` : ""}
        {e.km ? ` · ${fmtNum(e.km, 2)} km` : ""}
        {e.time ? ` en ${e.time}` : ""}
        {pace ? ` · ${paceStr(parseMin(e.time), e.km)}` : ""}
      </p>
      {e.sets && e.sets.length > 0 && (
        <div className="table-wrap">
          <table className="sets-table">
            <tbody>
              {e.sets.map((r, i) => (
                <tr key={i}>
                  <td>{r.ex}</td>
                  <td>{setLabel(r)}</td>
                  <td>{r.kg !== "" && r.kg != null ? `${fmtNum(r.kg, 1)} kg` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {vol > 0 && <p className="muted small">Volumen total: {fmtNum(vol)} kg</p>}
        </div>
      )}
    </>
  );
}

export default function Gym() {
  const { entries, settings } = useData();
  const mine = entries.filter((e) => e.section === "gym");
  const st = weekGymStats(entries, settings);
  const best = bestLifts(entries);
  const [ex, setEx] = useState("");
  const chosen = ex || (best[0] && best[0].ex) || "";
  const history = chosen ? liftHistory(entries, chosen) : [];
  const runs = sessions(entries).filter((e) => e.activity === "Correr" && runPace(e) && e.date).sort((a, b) => a.date.localeCompare(b.date));
  const bestRun = [...runs].sort((a, b) => runPace(a) - runPace(b))[0];
  const longest = [...sessions(entries).filter((e) => e.km)].sort((a, b) => b.km - a.km)[0];
  const month = new Date().getMonth();
  const kmMonth = sessions(entries)
    .filter((e) => e.date && parseIso(e.date).getMonth() === month && parseIso(e.date).getFullYear() === new Date().getFullYear())
    .reduce((a, e) => a + (Number(e.km) || 0), 0);
  const total = st.gym + st.run, goal = st.gymGoal + st.runGoal;

  const sentence =
    total === 0
      ? `Esta semana aún no has apuntado entrenos. Tu objetivo: ${st.gymGoal} días de gimnasio y ${st.runGoal} de correr.`
      : `Llevas ${st.gym} de ${st.gymGoal} días de gimnasio y ${st.run} de ${st.runGoal} de correr esta semana${st.km ? `, con ${fmtNum(st.km, 1)} km` : ""}.`;

  return (
    <div className="page">
      <Hero color={S.color} title="Gimnasio" aside={<Ring value={total} max={goal} label={`${total}/${goal}`} sub="esta semana" />}>
        <p>{sentence}</p>
      </Hero>
      <div className="split">
        <div className="col">
          <Composer
            section="gym"
            kinds={S.kinds}
            ph={S.ph}
            submitLabel={(k) => (k === "Sesión" ? "Guardar sesión" : "Guardar")}
            renderFields={(kind, d, set) => {
              if (kind !== "Sesión") return null;
              const act = d.activity || "Gimnasio";
              return (
                <>
                  <div className="row">
                    <Segmented label="Actividad" options={["Gimnasio", "Correr"]} value={act} onChange={(v) => set("activity", v)} />
                    <Field label="Día"><input className="input" type="date" value={d.date || today()} onChange={(e) => set("date", e.target.value)} /></Field>
                    {act === "Correr" && (
                      <>
                        <Field label="Km"><input className="input narrow" inputMode="decimal" placeholder="8,5" value={d.km || ""} onChange={(e) => set("km", e.target.value)} /></Field>
                        <Field label="Tiempo"><input className="input narrow" inputMode="numeric" placeholder="45:30" value={d.time || ""} onChange={(e) => set("time", e.target.value)} /></Field>
                      </>
                    )}
                  </div>
                  {act === "Gimnasio" && <SetsEditor rows={d.sets || [emptyRow()]} onChange={(rows) => set("sets", rows)} entries={entries} />}
                </>
              );
            }}
            buildEntry={(kind, d) => {
              if (kind !== "Sesión") return {};
              const activity = d.activity || "Gimnasio";
              const out = { activity, date: d.date || today(), allowEmpty: true };
              if (activity === "Correr") {
                const km = num(d.km);
                if (!km) return "Pon los kilómetros que has corrido.";
                out.km = Math.round(km * 100) / 100;
                if ((d.time || "").trim()) out.time = d.time.trim();
              } else {
                const sets = (d.sets || []).filter((r) => r.ex.trim()).map((r) => ({ ex: r.ex.trim(), s: num(r.s) || "", r: String(r.r).trim(), kg: num(r.kg) ?? "" }));
                if (!sets.length && !(d.text || "").trim()) return "Añade al menos un ejercicio o un nombre para la sesión.";
                if (sets.length) out.sets = sets;
              }
              return out;
            }}
          />
          <EntryList entries={mine} kinds={S.kinds} renderBody={(e) => <SessionBody e={e} />} empty="Apunta tu primer entreno con sus series y aquí verás el historial." />
        </div>
        <aside className="col side">
          <Panel title="Progresión">
            {best.length ? (
              <>
                <select className="input" aria-label="Ejercicio" value={chosen} onChange={(e) => setEx(e.target.value)}>
                  {best.map((b) => <option key={b.ex} value={b.ex}>{b.ex}</option>)}
                </select>
                <LineChart points={history} unit="kg" />
              </>
            ) : (
              <Empty>Cuando apuntes sesiones con kilos verás aquí cómo sube cada ejercicio.</Empty>
            )}
          </Panel>
          <Panel title="Mejores pesos">
            {best.length ? (
              <ul className="kv">
                {best.slice(0, 8).map((b) => (
                  <li key={b.ex}><span>{b.ex}</span><b>{fmtNum(b.kg, 1)} kg</b></li>
                ))}
              </ul>
            ) : <p className="muted small">Se calculan solos con tus sesiones.</p>}
          </Panel>
          <Panel title="Running">
            <ul className="kv">
              <li><span>Km en {MONTHS[month]}</span><b>{fmtNum(kmMonth, 1)} km</b></li>
              {bestRun && <li><span>Mejor ritmo</span><b>{paceStr(parseMin(bestRun.time), bestRun.km)}</b></li>}
              {longest && <li><span>Tirada más larga</span><b>{fmtNum(longest.km, 1)} km</b></li>}
            </ul>
            {runs.length >= 2 && (
              <LineChart points={runs.map((r) => ({ x: new Date(r.date + "T12:00").getTime(), y: Math.round(runPace(r) * 100) / 100 }))} invert
                format={(v) => { const s = Math.round(v * 60); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; }} unit="/km" />
            )}
          </Panel>
          <IdeasPanel
            section="gym"
            saveKind="Pendiente"
            saveLabel="Guardar para probar"
            savedTexts={mine.map((e) => e.text || "")}
            aiPrompt={() => aiPromptFor(S.label, "Sugiere 4 ideas concretas para variar o mejorar sus entrenamientos de gimnasio y running según lo apuntado. Nada de dietas ni calorías.", mine)}
          />
        </aside>
      </div>
    </div>
  );
}
