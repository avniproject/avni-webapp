import { format, addDays, subDays, parseISO } from "date-fns";

export const ISO = "yyyy-MM-dd";

export function todayIso() {
  return format(new Date(), ISO);
}

export function lastNDaysIncludingToday(n) {
  const today = new Date();
  const out = [];
  for (let i = n - 1; i >= 0; i--) out.push(format(subDays(today, i), ISO));
  return out;
}

export function prettyDate(iso) {
  if (!iso) return "";
  return format(parseISO(iso), "EEE d MMM");
}

export function dayOfMonth(iso) {
  if (!iso) return "";
  return format(parseISO(iso), "d");
}

export function weekdayShort(iso) {
  if (!iso) return "";
  return format(parseISO(iso), "EEE");
}

export function isFutureIso(iso) {
  return iso > todayIso();
}

export { addDays, subDays, parseISO, format };
