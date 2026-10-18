import React, { useEffect, useMemo, useRef, useState } from "react";
import { useData } from "./lib/data.jsx";
import { CHECKABLE } from "./sections/registry.js";
import { relDate, fmtShort, iso, addDays, mondayOf, MONTHS } from "./lib/dates.js";
import { BANK, pickIdeas, askClaude, getAiKey } from "./lib/ideas.js";

/* ───────── Cabecera de color de cada sección ───────── */
export function Hero({ color, title, children, aside, ink }) {
  return (
    <header className="hero" style={{ "--hc": color, ...(ink ? { "--hon": ink } : {}) }}>
      <div className="hero-main">
        <h1 className="hero-title">{title}</h1>
        {children && <div className="hero-text">{children}</div>}
      </div>
      {aside && <div className="hero-aside">{aside}</div>}
    </header>
  );
}

export function Panel({ title, children, className = "", action }) {
  return (
    <section className={`panel ${className}`}>
      {(title || action) && (
        <div className="panel-head">
          {title && <h2>{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Empty({ children }) {
  return <div className="empty">{children}</div>;
}

/* ───────── Botón de borrar con confirmación ───────── */
export function ConfirmButton({ onConfirm, label = "Borrar", className = "" }) {
  const [armed, setArmed] = useState(false);
  const t = useRef();
  useEffect(() => () => clearTimeout(t.current), []);
  return (
    <button
      type="button"
      className={`btn-ghost danger ${armed ? "armed" : ""} ${className}`}
      onClick={() => {
        if (armed) {
          setArmed(false);
          onConfirm();
        } else {
          setArmed(true);
          clearTimeout(t.current);
          t.current = setTimeout(() => setArmed(false), 3500);
        }
      }}
    >
      {armed ? "¿Seguro?" : label}
    </button>
  );
}

/* ───────── Selector de tipo en forma de pastillas ───────── */
export function Segmented({ options, value, onChange, label }) {
  return (
    <div className="seg" role="radiogroup" aria-label={label}>
      {options.map((o) => {
        const v = typeof o === "string" ? o : o.value;
        const l = typeof o === "string" ? o : o.label;
        return (
          <button key={v} type="button" role="radio" aria-checked={value === v} className="seg-btn" onClick={() => onChange(v)}>
            {l}
          </button>
        );
      })}
    </div>
  );
}

export function Field({ label, children, grow, hint }) {
  return (
    <label className={`field ${grow ? "grow" : ""}`}>
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

/* ───────── Formulario para apuntar cosas ─────────
   renderFields(kind, draft, set) → campos extra
   buildEntry(kind, draft) → objeto con campos extra, o un texto de error
*/
export function Composer({ section, kinds, ph = {}, renderFields, buildEntry, textareaKinds = [], beforeText, submitLabel, hideText }) {
  const { addEntry, notify } = useData();
  const [kind, setKind] = useState(kinds[0]);
  const [draft, setDraft] = useState({});
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));
  const isArea = textareaKinds.includes(kind);
  const noText = hideText && hideText(kind);

  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const text = (draft.text || "").trim();
    setBusy(true);
    let extra;
    try {
      extra = buildEntry ? await buildEntry(kind, draft) : {};
    } finally {
      setBusy(false);
    }
    if (typeof extra === "string") return notify(extra);
    const { allowEmpty, ...fields } = extra || {};
    if (!text && !allowEmpty) return notify("Escribe algo antes de guardar.");
    addEntry({ section, kind, text, ...fields }, "Guardado");
    setDraft({});
  };

  return (
    <form className="composer" onSubmit={submit}>
      {kinds.length > 1 && (
        <Segmented
          label="Tipo"
          options={kinds}
          value={kind}
          onChange={(k) => {
            setKind(k);
          }}
        />
      )}
      {beforeText && beforeText(kind)}
      {!noText &&
        (isArea ? (
          <textarea
            className="input area"
            aria-label="Texto"
            placeholder={ph[kind] || ""}
            value={draft.text || ""}
            onChange={(e) => set("text", e.target.value)}
          />
        ) : (
          <input
            className="input big"
            aria-label="Texto"
            placeholder={ph[kind] || "Escribe aquí"}
            value={draft.text || ""}
            onChange={(e) => set("text", e.target.value)}
          />
        ))}
      {renderFields && renderFields(kind, draft, set)}
      <div className="composer-foot">
        <button className="btn primary" type="submit" disabled={busy}>
          {typeof submitLabel === "function" ? submitLabel(kind) : submitLabel || "Guardar"}
        </button>
      </div>
    </form>
  );
}

/* ───────── Lista de entradas con filtros ───────── */
export function EntryList({ entries, kinds, renderBody, empty, initialFilter = "Todo", limit = 60, onRemove }) {
  const { updateEntry, removeEntry } = useData();
  const [filter, setFilter] = useState(initialFilter);
  const [showAll, setShowAll] = useState(false);
  const sorted = useMemo(() => [...entries].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)), [entries]);
  const shown = filter === "Todo" ? sorted : sorted.filter((e) => e.kind === filter);
  const visible = showAll ? shown : shown.slice(0, limit);
  const count = (k) => sorted.filter((e) => e.kind === k).length;

  if (!sorted.length) return <Empty>{empty || "Todavía no hay nada. Apunta lo primero arriba."}</Empty>;
  return (
    <div className="list-wrap">
      {kinds && kinds.length > 1 && (
        <div className="filters" role="group" aria-label="Filtrar">
          {["Todo", ...kinds].filter((k) => k === "Todo" || count(k)).map((k) => (
            <button key={k} type="button" className="chip" aria-pressed={filter === k} onClick={() => setFilter(k)}>
              {k} <span className="chip-n">{k === "Todo" ? sorted.length : count(k)}</span>
            </button>
          ))}
        </div>
      )}
      {visible.length ? (
        <ul className="entries">
          {visible.map((e) => (
            <li key={e.id} className={`entry ${e.done ? "is-done" : ""}`}>
              {CHECKABLE.has(e.kind) ? (
                <button
                  type="button"
                  className="check"
                  aria-pressed={!!e.done}
                  aria-label={e.done ? "Marcar como no hecho" : "Marcar como hecho"}
                  onClick={() => updateEntry(e.id, { done: !e.done })}
                />
              ) : (
                <span className="bullet" aria-hidden="true" />
              )}
              <div className="entry-body">
                <div className="entry-meta">
                  <span className="badge">{e.kind}</span>
                  <span>{e.date && e.kind === "Sesión" ? relDateIso(e.date) : relDate(e.createdAt)}</span>
                </div>
                {renderBody ? renderBody(e) : <p className="entry-text">{e.text}</p>}
              </div>
              <ConfirmButton onConfirm={() => (onRemove ? onRemove(e) : removeEntry(e.id))} />
            </li>
          ))}
        </ul>
      ) : (
        <Empty>Nada en «{filter}» todavía.</Empty>
      )}
      {shown.length > visible.length && (
        <button type="button" className="btn-ghost more" onClick={() => setShowAll(true)}>
          Ver las {shown.length - visible.length} anteriores
        </button>
      )}
    </div>
  );
}
const relDateIso = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return relDate(new Date(y, m - 1, d, 12).getTime());
};

/* ───────── Medidores ───────── */
export function Meter({ label, value, max, unit = "", note, color }) {
  const pct = max ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className={`meter ${max && value >= max ? "met" : ""}`} style={color ? { "--mc": color } : undefined}>
      <div className="meter-top">
        <span className="meter-label">{label}</span>
        <span className="meter-val">
          {value}
          {max ? <small> de {max}{unit ? ` ${unit}` : ""}</small> : unit ? <small> {unit}</small> : null}
        </span>
      </div>
      {max ? (
        <div className="meter-bar" role="img" aria-label={`${value} de ${max}`}>
          <span style={{ width: `${pct}%` }} />
        </div>
      ) : null}
      {note && <span className="meter-note">{note}</span>}
    </div>
  );
}

export function Ring({ value, max, size = 132, label, sub }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const pct = max ? Math.min(1, value / max) : 0;
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">
        <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" strokeOpacity=".22" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={r} fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${c * pct} ${c}`} transform="rotate(-90 60 60)" className="ring-arc"
        />
      </svg>
      <div className="ring-label">
        <b>{label}</b>
        {sub && <span>{sub}</span>}
      </div>
    </div>
  );
}

/* ───────── Gráfica de líneas sencilla ───────── */
export function LineChart({ points, unit = "", color = "var(--page)", invert = false, format = (v) => v }) {
  const W = 640, H = 200, P = { l: 44, r: 16, t: 16, b: 28 };
  if (points.length < 2) return <Empty>Necesitas al menos dos registros para ver la evolución.</Empty>;
  const xs = points.map((p) => p.x), ys = points.map((p) => p.y);
  let minY = Math.min(...ys), maxY = Math.max(...ys);
  if (minY === maxY) { minY -= 1; maxY += 1; }
  const padY = (maxY - minY) * 0.15;
  minY -= padY; maxY += padY;
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const sx = (x) => P.l + ((x - minX) / (maxX - minX || 1)) * (W - P.l - P.r);
  const sy = (y) => {
    const t = (y - minY) / (maxY - minY);
    return invert ? P.t + t * (H - P.t - P.b) : H - P.b - t * (H - P.t - P.b);
  };
  const d = points.map((p, i) => `${i ? "L" : "M"}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(" ");
  const area = `${d} L${sx(maxX).toFixed(1)},${H - P.b} L${sx(minX).toFixed(1)},${H - P.b} Z`;
  const ticks = [0, 0.5, 1].map((t) => minY + padY + t * (maxY - minY - 2 * padY));
  const last = points[points.length - 1];
  return (
    <div className="chart" style={{ "--lc": color }}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Evolución: de ${format(points[0].y)} a ${format(last.y)} ${unit}`}>
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={P.l} x2={W - P.r} y1={sy(t)} y2={sy(t)} className="grid" />
            <text x={P.l - 8} y={sy(t) + 4} textAnchor="end" className="axis">{format(Math.round(t * 10) / 10)}</text>
          </g>
        ))}
        <text x={P.l} y={H - 8} className="axis">{fmtShort(new Date(minX))}</text>
        <text x={W - P.r} y={H - 8} textAnchor="end" className="axis">{fmtShort(new Date(maxX))}</text>
        <path d={area} className="area" />
        <path d={d} className="line" />
        {points.map((p, i) => <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={i === points.length - 1 ? 5 : 3} className={i === points.length - 1 ? "dot last" : "dot"} />)}
        <text x={Math.min(sx(last.x), W - P.r - 4)} y={sy(last.y) - 12} textAnchor="end" className="axis strong">{format(last.y)} {unit}</text>
      </svg>
    </div>
  );
}

/* ───────── Mapa de actividad (últimas semanas) ───────── */
export function Heatmap({ counts, weeks = 16 }) {
  const start = addDays(mondayOf(new Date()), -(weeks - 1) * 7);
  const todayIso = iso(new Date());
  const cols = [...Array(weeks)].map((_, w) => [...Array(7)].map((_, d) => addDays(start, w * 7 + d)));
  const level = (n) => (n === 0 ? 0 : n === 1 ? 1 : n <= 3 ? 2 : n <= 5 ? 3 : 4);
  return (
    <div className="heat-wrap">
      <div className="heat" style={{ gridTemplateColumns: `repeat(${weeks}, 1fr)` }}>
        {cols.map((col, w) => (
          <div key={w} className="heat-col">
            <span className="heat-m">{col[0].getDate() <= 7 ? MONTHS[col[0].getMonth()] : ""}</span>
            {col.map((day) => {
              const k = iso(day), n = counts.get(k) || 0;
              const future = k > todayIso;
              return <span key={k} className={`heat-cell l${level(n)} ${future ? "future" : ""} ${k === todayIso ? "is-today" : ""}`} title={`${fmtShort(day)}: ${n} ${n === 1 ? "registro" : "registros"}`} />;
            })}
          </div>
        ))}
      </div>
      <div className="heat-legend"><span>Menos</span>{[0, 1, 2, 3, 4].map((l) => <span key={l} className={`heat-cell l${l}`} />)}<span>Más</span></div>
    </div>
  );
}

/* ───────── Panel de ideas ───────── */
export function IdeasPanel({ section, saveKind = "Idea", saveLabel = "Guardar como idea", aiPrompt, extraTab, savedTexts = [] }) {
  const { addEntry } = useData();
  const hasAi = Boolean(getAiKey());
  const [tab, setTab] = useState("banco");
  const [items, setItems] = useState(() => pickIdeas(section, savedTexts));
  const [aiItems, setAiItems] = useState([]);
  const [extraItems, setExtraItems] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState({});

  const loadAi = async () => {
    setStatus("loading"); setError("");
    try {
      const prev = aiItems.map((x) => x.title).join("; ");
      setAiItems(await askClaude(aiPrompt() + (prev ? `\nNo repitas: ${prev}.` : "")));
      setStatus("idle");
    } catch (e) {
      setError(e.message); setStatus("idle");
    }
  };
  const loadExtra = async () => {
    setStatus("loading"); setError("");
    try {
      setExtraItems(await extraTab.load());
      setStatus("idle");
    } catch (e) {
      setError(e.message); setStatus("idle");
    }
  };
  const save = (it) => {
    addEntry({ section, kind: saveKind, text: it.detail && saveKind !== "Quiero ver" ? `${it.title}: ${it.detail}` : it.title }, "Guardado");
    setSaved((s) => ({ ...s, [it.title]: true }));
  };

  const tabs = [{ value: "banco", label: "Ideas" }];
  if (extraTab) tabs.push({ value: "extra", label: extraTab.label });
  tabs.push({ value: "ia", label: "Con IA" });
  const list = tab === "banco" ? items : tab === "ia" ? aiItems : extraItems || [];

  return (
    <Panel title="Cosas nuevas" className="ideas">
      <Segmented label="Origen de las ideas" options={tabs} value={tab} onChange={(v) => {
        setTab(v); setError("");
        if (v === "extra" && extraItems === null) loadExtra();
      }} />
      {tab === "ia" && !hasAi && (
        <p className="muted small">Activa la IA en Ajustes con tu propia clave de la API de Claude para recibir ideas basadas en lo que apuntas. Es opcional y de pago por uso, aunque son céntimos.</p>
      )}
      {error && <p className="error small">{error}</p>}
      {status === "loading" && <p className="loading small">Buscando ideas…</p>}
      {list.length > 0 && (
        <ul className="ideas-list">
          {list.map((it) => (
            <li key={it.title}>
              {it.poster && <img src={it.poster} alt="" loading="lazy" />}
              <div>
                <b>{it.title}</b>
                {it.rating ? <span className="small muted"> · {String(it.rating).replace(".", ",")} en TMDB</span> : null}
                {it.detail && <p>{it.detail}</p>}
                {saved[it.title] ? <span className="small ok">Guardado</span> : (
                  <button type="button" className="btn-ghost small-btn" onClick={() => save(it)}>{saveLabel}</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="ideas-foot">
        {tab === "banco" && (
          <button type="button" className="btn" onClick={() => {
            const next = pickIdeas(section, savedTexts.concat(items.map((i) => i.title)));
            setItems(next.length ? next : pickIdeas(section, savedTexts));
          }}>
            Otras ideas
          </button>
        )}
        {tab === "ia" && hasAi && (
          <button type="button" className="btn primary" disabled={status === "loading"} onClick={loadAi}>
            {aiItems.length ? "Otras ideas" : "Pedir ideas a la IA"}
          </button>
        )}
        {tab === "extra" && extraItems !== null && (
          <button type="button" className="btn" disabled={status === "loading"} onClick={loadExtra}>Actualizar</button>
        )}
      </div>
    </Panel>
  );
}

export { BANK };
