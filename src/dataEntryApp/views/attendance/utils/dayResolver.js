import { Calendar } from "openchs-models";

// Build a Map<isoDate, {dayType, marker}> for a list of ISO dates. Returns
// dayType ∈ {working_day, weekly_off, public_holiday, working_override}.
// Mirrors Calendar.dayType(date, markers) from openchs-models.
export function buildDayStatusMap(calendar, markers, isoDates) {
  const map = new Map();
  if (!calendar) {
    isoDates.forEach((iso) => map.set(iso, { dayType: null, marker: null }));
    return map;
  }
  const calendarEntity = Calendar.fromResource({
    ...calendar,
    workingPattern: calendar.workingPattern,
  });
  // Calendar._findActiveMarker (openchs-models) matches markers on
  // m.calendarUUID === this.uuid. The /web/calendarDateMarker projection may
  // omit calendarUUID (since it was the query filter) — stamp our calendar's
  // uuid onto every marker so the match doesn't drop everything silently.
  const normalisedMarkers = (markers || []).map((m) => ({
    ...m,
    calendarUUID: m.calendarUUID || calendar.uuid,
    markerDate: typeof m.markerDate === "string" ? m.markerDate : String(m.markerDate),
  }));
  isoDates.forEach((iso) => {
    const dayType = calendarEntity.dayType(iso, normalisedMarkers);
    const marker = normalisedMarkers.find((m) => !m.voided && String(m.markerDate).slice(0, 10) === iso) || null;
    map.set(iso, { dayType, marker });
  });
  return map;
}

export const DAY_TYPES = {
  WORKING_DAY: "working_day",
  WEEKLY_OFF: "weekly_off",
  PUBLIC_HOLIDAY: "public_holiday",
  WORKING_OVERRIDE: "working_override",
};

export function isHolidayLike(dayType) {
  return dayType === DAY_TYPES.WEEKLY_OFF || dayType === DAY_TYPES.PUBLIC_HOLIDAY;
}
