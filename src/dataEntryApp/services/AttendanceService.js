import { httpClient as http } from "common/utils/httpClient";

const AttendanceService = {
  listAttendanceTypes(subjectTypeUUID) {
    return http.get(`/web/attendanceType?subjectTypeUUID=${encodeURIComponent(subjectTypeUUID)}`).then((r) => r.data || []);
  },

  // Inclusive date range, ISO "YYYY-MM-DD" strings.
  listSessions(groupSubjectUUID, fromIsoDate, toIsoDate) {
    const params = new URLSearchParams({
      groupSubjectUUID,
      scheduledDateFrom: fromIsoDate,
      scheduledDateTo: toIsoDate,
    });
    return http.get(`/web/session?${params}`).then((r) => r.data || []);
  },

  saveSession(payload) {
    return http.post("/web/session", payload).then((r) => r.data);
  },

  updateSession(uuid, payload) {
    return http.put(`/web/session/${uuid}`, payload).then((r) => r.data);
  },

  voidSession(uuid) {
    return http.delete(`/web/session/${uuid}`).then((r) => r.data);
  },

  // Resolves the calendar applicable to the subject server-side via
  // CalendarsResolver (per-location match walking lineage, with global-default
  // fallback). 404 means "no calendar configured" — the DEA's edge case.
  resolveCalendarForSubject(subjectUUID) {
    return http
      .get(`/web/calendar/forSubject?subjectUUID=${encodeURIComponent(subjectUUID)}`)
      .then((r) => r.data)
      .catch((err) => {
        if (err?.response?.status === 404) return null;
        throw err;
      });
  },

  listMarkers(calendarUUID, year) {
    return http.get(`/web/calendarDateMarker?calendarUUID=${encodeURIComponent(calendarUUID)}&year=${year}`).then((r) => {
      const data = r.data;
      if (Array.isArray(data)) return data;
      if (data?._embedded?.calendarDateMarker) return data._embedded.calendarDateMarker;
      if (data?.content) return data.content;
      return [];
    });
  },

  getConcept(uuid) {
    return http.get(`/web/concept/${encodeURIComponent(uuid)}`).then((r) => r.data);
  },
};

export default AttendanceService;
