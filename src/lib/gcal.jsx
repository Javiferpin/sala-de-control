// Conexión con Google Calendar (ver y crear eventos en tu calendario principal).
// Usa Google Identity Services: Google da un permiso que dura 1 hora y se renueva
// con un clic en "Reconectar" (normalmente sin volver a pedir nada).
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { googleClientId } from "../config.js";
import { isConfigured } from "./store.js";
import { iso, pad, parseIso, addDays } from "./dates.js";

const SCOPE = "https://www.googleapis.com/auth/calendar.events";
const API = "https://www.googleapis.com/calendar/v3/calendars/primary/events";
const TZ = "Europe/Madrid";
const FLAG = "sala-de-control:gcal-on";
const TOKEN = "sala-de-control:gcal-token";
const BYDAY = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

export const gcalAvailable = () => Boolean(googleClientId) && isConfigured();

let gisPromise = null;
function loadGis() {
  if (window.google && window.google.accounts && window.google.accounts.oauth2) return Promise.resolve();
  if (!gisPromise) {
    gisPromise = new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true;
      s.onload = res;
      s.onerror = () => rej(new Error("No se ha podido cargar el acceso de Google."));
      document.head.appendChild(s);
    });
  }
  return gisPromise;
}

const ls = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* nada */ } },
  del(k) { try { localStorage.removeItem(k); } catch { /* nada */ } },
};
const ss = {
  get(k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch { /* nada */ } },
  del(k) { try { sessionStorage.removeItem(k); } catch { /* nada */ } },
};

const Ctx = createContext(null);
export const useGcal = () => useContext(Ctx);

export function GcalProvider({ children, email }) {
  const [token, setToken] = useState(() => {
    const t = ss.get(TOKEN);
    return t && t.exp > Date.now() + 60000 ? t : null;
  });
  const [wanted, setWanted] = useState(() => ls.get(FLAG) === "1");
  const [version, setVersion] = useState(0); // sube cuando cambia algo para volver a leer
  const [error, setError] = useState("");

  const valid = token && token.exp > Date.now() + 60000;
  const status = !gcalAvailable() ? "unavailable" : valid ? "on" : wanted ? "expired" : "off";

  // Avisar cuando caduque el permiso
  useEffect(() => {
    if (!valid) return;
    const t = setTimeout(() => setToken(null), token.exp - Date.now() - 60000);
    return () => clearTimeout(t);
  }, [valid, token]);

  const connect = useCallback(async () => {
    setError("");
    await loadGis();
    return new Promise((resolve) => {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: googleClientId,
        scope: SCOPE,
        hint: email || undefined,
        prompt: wanted ? "" : "consent",
        callback: (r) => {
          if (r.error) {
            setError("Google no ha dado permiso al calendario.");
            return resolve(false);
          }
          const t = { value: r.access_token, exp: Date.now() + Number(r.expires_in || 3600) * 1000 };
          ss.set(TOKEN, t);
          ls.set(FLAG, "1");
          setToken(t);
          setWanted(true);
          setVersion((v) => v + 1);
          resolve(true);
        },
        error_callback: (e) => {
          setError(e && e.type === "popup_closed" ? "Has cerrado la ventana de Google antes de terminar." : "No se ha podido abrir la ventana de Google. Revisa que no estén bloqueadas las ventanas emergentes.");
          resolve(false);
        },
      });
      client.requestAccessToken();
    });
  }, [email, wanted]);

  const disconnect = useCallback(async () => {
    try {
      if (token && window.google) window.google.accounts.oauth2.revoke(token.value, () => {});
    } catch { /* nada */ }
    ss.del(TOKEN);
    ls.del(FLAG);
    setToken(null);
    setWanted(false);
  }, [token]);

  const call = useCallback(
    async (url, opts = {}) => {
      if (!valid) throw new Error("El calendario necesita reconectarse.");
      const res = await fetch(url, { ...opts, headers: { Authorization: `Bearer ${token.value}`, "Content-Type": "application/json", ...(opts.headers || {}) } });
      if (res.status === 401) {
        ss.del(TOKEN);
        setToken(null);
        throw new Error("El permiso de Google ha caducado. Pulsa «Reconectar».");
      }
      if (res.status === 403) throw new Error("Google ha rechazado la petición. ¿Está activada la API de Google Calendar?");
      if (!res.ok && res.status !== 204 && res.status !== 410) throw new Error(`Google Calendar ha dado un error (${res.status}).`);
      return res.status === 204 || res.status === 410 ? null : res.json();
    },
    [valid, token]
  );

  // Crear un evento. ev = { title, date (aaaa-mm-dd) | weekday (0-6), time ("HH:MM") opcional, durationMin }
  const createEvent = useCallback(
    async (ev) => {
      const body = { summary: ev.title, description: "Creado desde Sala de control" };
      let date = ev.date;
      if (ev.weekday !== undefined) {
        const t = new Date();
        const diff = (ev.weekday - ((t.getDay() + 6) % 7) + 7) % 7;
        date = iso(addDays(t, diff));
        body.recurrence = [`RRULE:FREQ=WEEKLY;BYDAY=${BYDAY[ev.weekday]}`];
      }
      if (ev.time) {
        const [h, m] = ev.time.split(":").map(Number);
        const start = new Date(parseIso(date).setHours(h, m, 0, 0));
        const end = new Date(start.getTime() + (ev.durationMin || 60) * 60000);
        const fmt = (d) => `${iso(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
        body.start = { dateTime: fmt(start), timeZone: TZ };
        body.end = { dateTime: fmt(end), timeZone: TZ };
      } else {
        body.start = { date };
        body.end = { date: iso(addDays(parseIso(date), 1)) };
      }
      const r = await call(API, { method: "POST", body: JSON.stringify(body) });
      setVersion((v) => v + 1);
      return r.id;
    },
    [call]
  );

  const deleteEvent = useCallback(
    async (id) => {
      await call(`${API}/${encodeURIComponent(id)}`, { method: "DELETE" });
      setVersion((v) => v + 1);
    },
    [call]
  );

  const listEvents = useCallback(
    async (fromIso, toIso) => {
      const params = new URLSearchParams({
        timeMin: parseIso(fromIso).toISOString(),
        timeMax: addDays(parseIso(toIso), 1).toISOString(),
        singleEvents: "true",
        orderBy: "startTime",
        maxResults: "250",
      });
      const r = await call(`${API}?${params}`);
      return (r.items || []).filter((e) => e.status !== "cancelled").map(normalize);
    },
    [call]
  );

  return (
    <Ctx.Provider value={{ status, error, connect, disconnect, createEvent, deleteEvent, listEvents, version }}>
      {children}
    </Ctx.Provider>
  );
}

// Convierte un evento de Google en algo fácil de pintar por días
function normalize(e) {
  const allDay = Boolean(e.start && e.start.date);
  let days = [], time = "";
  if (allDay) {
    let d = parseIso(e.start.date);
    const end = parseIso(e.end.date);
    while (d < end && days.length < 31) { days.push(iso(d)); d = addDays(d, 1); }
  } else {
    const s = new Date(e.start.dateTime);
    days = [iso(s)];
    time = `${pad(s.getHours())}:${pad(s.getMinutes())}`;
  }
  return { id: e.id, seriesId: e.recurringEventId || e.id, title: e.summary || "(Sin título)", days, time, allDay, link: e.htmlLink || "" };
}

// Eventos de Google para un rango de fechas (se vuelve a leer al conectar o crear)
export function useGcalEvents(fromIso, toIso) {
  const g = useGcal();
  const [state, setState] = useState({ events: [], loading: false, error: "" });
  const on = g && g.status === "on";
  useEffect(() => {
    if (!on) { setState({ events: [], loading: false, error: "" }); return; }
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: "" }));
    g.listEvents(fromIso, toIso)
      .then((events) => alive && setState({ events, loading: false, error: "" }))
      .catch((e) => alive && setState({ events: [], loading: false, error: e.message }));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, fromIso, toIso, g && g.version]);
  return state;
}
