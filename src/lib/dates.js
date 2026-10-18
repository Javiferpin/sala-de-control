export const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
export const DAYS_LONG = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
export const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
export const MONTHS_LONG = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

export const pad = (n) => String(n).padStart(2, "0");
export const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const today = () => iso(new Date());
export const wd = (d) => (d.getDay() + 6) % 7; // lunes = 0
export const parseIso = (s) => {
  const [y, m, d] = String(s).split("-").map(Number);
  return new Date(y, m - 1, d);
};
export const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
export const mondayOf = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - wd(x));
  return x;
};
export const weekDays = (offset = 0) => {
  const base = addDays(mondayOf(new Date()), offset * 7);
  return [...Array(7)].map((_, i) => addDays(base, i));
};
export const fmtShort = (d) => `${d.getDate()} ${MONTHS[d.getMonth()]}`;
export const fmtLong = (d) => `${DAYS_LONG[wd(d)]} ${d.getDate()} de ${MONTHS_LONG[d.getMonth()]}`;
export const daysUntil = (isoStr) => {
  if (!isoStr) return null;
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return Math.round((parseIso(isoStr) - t) / 864e5);
};
export function relDate(ms) {
  const t = new Date(ms);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.round((now - new Date(t.getFullYear(), t.getMonth(), t.getDate())) / 864e5);
  if (diff === 0) return "hoy";
  if (diff === 1) return "ayer";
  if (diff === -1) return "mañana";
  if (diff > 1 && diff < 7) return `hace ${diff} días`;
  return fmtShort(t) + (t.getFullYear() !== now.getFullYear() ? ` ${t.getFullYear()}` : "");
}
export const greeting = () => {
  const h = new Date().getHours();
  return h < 6 ? "Buenas noches" : h < 13 ? "Buenos días" : h < 21 ? "Buenas tardes" : "Buenas noches";
};
export function parseMin(s) {
  s = String(s || "").trim();
  if (!s) return 0;
  const p = s.split(":").map(Number);
  if (p.some(isNaN)) return 0;
  return p.length === 3 ? p[0] * 60 + p[1] + p[2] / 60 : p.length === 2 ? p[0] + p[1] / 60 : p[0];
}
export function paceStr(min, km) {
  if (!min || !km) return "";
  const sec = Math.round((min * 60) / km);
  return `${Math.floor(sec / 60)}:${pad(sec % 60)}/km`;
}
export const num = (v) => {
  const x = parseFloat(String(v ?? "").replace(",", "."));
  return isNaN(x) ? null : x;
};
export const fmtNum = (n, dec = 0) => Number(n).toLocaleString("es-ES", { maximumFractionDigits: dec });
