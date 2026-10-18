const TZ = "Asia/Jakarta";
const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

export function jakartaParts(d: Date = new Date()) {
  const f = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  const p = Object.fromEntries(f.formatToParts(d).map((x) => [x.type, x.value]));
  return { year: p.year, month: p.month, day: p.day, hour: p.hour, minute: p.minute };
}
/** Tanggal YYYY-MM-DD di zona waktu Jakarta */
export function toJakartaDate(d: Date | string = new Date()): string {
  const p = jakartaParts(typeof d === "string" ? new Date(d) : d);
  return `${p.year}-${p.month}-${p.day}`;
}
export const todayISO = () => toJakartaDate(new Date());
export function addDaysISO(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}
/** Senin dari minggu yang memuat tanggal iso */
export function startOfWeekISO(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0=Min
  return addDaysISO(iso, -((dow + 6) % 7));
}
export function startOfMonthISO(iso: string): string { return iso.slice(0, 8) + "01"; }
/** 17 Oktober 2026 */
export function formatDateID(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
/** 17 Oktober 2026, 10.00 WIB */
export function formatDateTimeWIB(input: Date | string): string {
  const dt = typeof input === "string" ? new Date(input) : input;
  const p = jakartaParts(dt);
  return `${formatDateID(`${p.year}-${p.month}-${p.day}`)}, ${p.hour}.${p.minute} WIB`;
}
export const hhmm = (t: string) => t.slice(0, 5);
export const timeToMinutes = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
export const minutesToTime = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
export function nowMinutesJakarta(): number { const p = jakartaParts(); return Number(p.hour) * 60 + Number(p.minute); }
