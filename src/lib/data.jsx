import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createStore } from "./store.js";

const Ctx = createContext(null);
export const useData = () => useContext(Ctx);

export function DataProvider({ children }) {
  const [store, setStore] = useState(null);
  const [user, setUser] = useState(undefined); // undefined = cargando, null = sin sesión
  const [entries, setEntries] = useState([]);
  const [events, setEvents] = useState([]);
  const [sections, setSections] = useState([]);
  const [settings, setSettings] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState(null);
  const toastT = useRef();

  const notify = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setToast(null), 3200);
  }, []);

  useEffect(() => {
    let off = () => {};
    createStore()
      .then((s) => {
        setStore(s);
        off = s.onUser(setUser);
      })
      .catch(() => notify("No se ha podido conectar con Firebase. Revisa config.js."));
    return () => off();
  }, [notify]);

  useEffect(() => {
    if (!store || !user) return;
    const fail = () => notify("No se han podido leer tus datos. Revisa las reglas de Firestore.");
    let pending = 4;
    const done = () => --pending <= 0 && setLoaded(true);
    const wrap = (set) => (v) => {
      set(v);
      done();
    };
    const subs = [
      store.subscribe("entries", wrap(setEntries), fail),
      store.subscribe("events", wrap(setEvents), fail),
      store.subscribe("sections", wrap(setSections), fail),
      store.subscribeSettings(wrap(setSettings), fail),
    ];
    return () => subs.forEach((u) => u && u());
  }, [store, user, notify]);

  const run = useCallback(
    async (fn, okMsg) => {
      try {
        await fn();
        if (okMsg) notify(okMsg);
      } catch (e) {
        console.error(e);
        notify("No se ha podido guardar. Comprueba tu conexión e inténtalo otra vez.");
      }
    },
    [notify]
  );

  const api = useMemo(
    () => ({
      store, user, entries, events, sections, settings, loaded, notify, toast,
      addEntry: (d, msg) => run(() => store.add("entries", { done: false, createdAt: Date.now(), ...d }), msg),
      updateEntry: (id, p) => run(() => store.update("entries", id, p)),
      removeEntry: (id) => run(() => store.remove("entries", id), "Borrado"),
      addEvent: (d) => run(() => store.add("events", { createdAt: Date.now(), ...d }), "Añadido al calendario"),
      removeEvent: (id) => run(() => store.remove("events", id), "Borrado"),
      addSection: (d) => run(() => store.add("sections", { createdAt: Date.now(), ...d }), "Sección creada"),
      updateSection: (id, p) => run(() => store.update("sections", id, p)),
      removeSection: (id) => run(() => store.remove("sections", id), "Sección borrada"),
      saveSettings: (p) => run(() => store.saveSettings(p)),
    }),
    [store, user, entries, events, sections, settings, loaded, notify, toast, run]
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
