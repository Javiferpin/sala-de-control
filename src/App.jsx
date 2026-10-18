import React, { useEffect, useState } from "react";
import { DataProvider, useData } from "./lib/data.jsx";
import { SECTIONS } from "./sections/registry.js";
import Home from "./sections/Home.jsx";
import Week from "./sections/Week.jsx";
import Gym from "./sections/Gym.jsx";
import Cine from "./sections/Cine.jsx";
import Tfm from "./sections/Tfm.jsx";
import Work from "./sections/Work.jsx";
import Personal from "./sections/Personal.jsx";
import Custom from "./sections/Custom.jsx";
import Settings from "./sections/Settings.jsx";
import { GcalProvider } from "./lib/gcal.jsx";

const PAGES = { inicio: Home, semana: Week, gym: Gym, cine: Cine, tfm: Tfm, trabajo: Work, personal: Personal, ajustes: Settings };
const MAIN = ["inicio", "semana", "gym", "cine", "tfm", "trabajo", "personal"];
const MOBILE = ["inicio", "semana", "gym", "personal"];

const readHash = () => {
  const h = decodeURIComponent(location.hash.slice(1));
  return PAGES[h] || h.startsWith("s:") ? h : "inicio";
};

export default function App() {
  return (
    <DataProvider>
      <Shell />
    </DataProvider>
  );
}

function Shell() {
  const { store, user, sections, toast, loaded } = useData();
  const [page, setPage] = useState(readHash);
  const [more, setMore] = useState(false);

  useEffect(() => {
    const on = () => setPage(readHash());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  const go = (p) => {
    setMore(false);
    if (p === page) return;
    location.hash = p;
    setPage(p);
    window.scrollTo({ top: 0 });
  };

  if (!store || user === undefined) return <div className="boot">Cargando…</div>;
  if (!user) return <Login />;

  const custom = sections.map((s) => ({ id: `s:${s.id}`, label: s.name, color: s.color }));
  const items = [...MAIN.map((id) => ({ id, label: SECTIONS[id].short, color: SECTIONS[id].color })), ...custom];
  const colorOfPage = page.startsWith("s:") ? (custom.find((c) => c.id === page) || {}).color : SECTIONS[page] && SECTIONS[page].color;
  const Page = page.startsWith("s:") ? null : PAGES[page];

  return (
    <GcalProvider email={user.email}>
    <div className="app" style={{ "--page": colorOfPage || "var(--c-inicio)" }}>
      <aside className="rail" aria-label="Secciones">
        <div className="brand">Sala de control</div>
        <nav className="rail-nav">
          {items.map((it) => (
            <button key={it.id} type="button" className="rail-item" aria-current={page === it.id ? "page" : undefined} style={{ "--ic": it.color }} onClick={() => go(it.id)}>
              <i aria-hidden="true" />
              {it.label}
            </button>
          ))}
        </nav>
        <button type="button" className="rail-item settings" aria-current={page === "ajustes" ? "page" : undefined} style={{ "--ic": "var(--ink-2)" }} onClick={() => go("ajustes")}>
          <i aria-hidden="true" />
          Ajustes
        </button>
      </aside>

      <main className="main">
        {store.mode === "demo" && (
          <div className="demo-bar">
            <b>Modo demo.</b> Ves datos de ejemplo y lo que apuntes se guarda solo en este navegador. Conecta Firebase para tenerlo en todos tus dispositivos.
          </div>
        )}
        {!loaded ? (
          <div className="boot">Cargando tus datos…</div>
        ) : Page ? (
          <Page key={page} go={go} />
        ) : (
          <Custom key={page} id={page.slice(2)} />
        )}
      </main>

      <nav className="tabbar" aria-label="Secciones">
        {MOBILE.map((id) => (
          <button key={id} type="button" className="tab" aria-current={page === id ? "page" : undefined} style={{ "--ic": SECTIONS[id].color }} onClick={() => go(id)}>
            <i aria-hidden="true" />
            {SECTIONS[id].short}
          </button>
        ))}
        <button type="button" className="tab" aria-expanded={more} aria-current={!MOBILE.includes(page) ? "page" : undefined} style={{ "--ic": "var(--ink-2)" }} onClick={() => setMore(!more)}>
          <i aria-hidden="true" className="dots" />
          Más
        </button>
      </nav>

      {more && (
        <div className="sheet-backdrop" onClick={() => setMore(false)}>
          <div className="sheet" role="dialog" aria-label="Más secciones" onClick={(e) => e.stopPropagation()}>
            {[...items.filter((i) => !MOBILE.includes(i.id)), { id: "ajustes", label: "Ajustes", color: "var(--ink-2)" }].map((it) => (
              <button key={it.id} type="button" className="sheet-item" style={{ "--ic": it.color }} onClick={() => go(it.id)}>
                <i aria-hidden="true" />
                {it.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
    </GcalProvider>
  );
}

function Login() {
  const { store, notify, toast } = useData();
  const [busy, setBusy] = useState(false);
  return (
    <div className="login">
      <div className="login-blocks" aria-hidden="true">
        {["gym", "cine", "tfm", "trabajo", "personal"].map((id) => <span key={id} style={{ background: SECTIONS[id].color }} />)}
      </div>
      <h1 className="login-title">Sala de control</h1>
      <p>Tu semana, tus entrenos, el TFM, el cine y tu diario. Todo en un sitio.</p>
      <button
        type="button"
        className="btn primary big"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            await store.signIn();
          } catch (e) {
            notify(e && e.code === "auth/unauthorized-domain"
              ? "Este dominio no está autorizado en Firebase. Añádelo en Authentication → Configuración."
              : "No se ha podido iniciar sesión. Inténtalo de nuevo.");
          }
          setBusy(false);
        }}
      >
        Entrar con Google
      </button>
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
