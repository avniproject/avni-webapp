import { httpClient as http } from "common/utils/httpClient";

const CALENDAR_URL = "/web/calendar";
const MARKER_URL = "/web/calendarDateMarker";

function unwrapList(resp, embeddedKey) {
  const data = resp.data;
  if (Array.isArray(data)) return data;
  if (data?._embedded?.[embeddedKey]) return data._embedded[embeddedKey];
  if (data?.content) return data.content;
  return [];
}

const CalendarService = {
  list() {
    return http.get(CALENDAR_URL).then((resp) => unwrapList(resp, "calendar"));
  },

  get(uuid) {
    return http.get(`${CALENDAR_URL}/${uuid}`).then((r) => r.data);
  },

  create(payload) {
    return http.post(CALENDAR_URL, payload).then((r) => r.data);
  },

  update(uuid, payload) {
    return http.put(`${CALENDAR_URL}/${uuid}`, payload).then((r) => r.data);
  },

  remove(uuid) {
    return http.delete(`${CALENDAR_URL}/${uuid}`);
  },

  setDefault(uuid) {
    return http.post(`${CALENDAR_URL}/${uuid}/set-default`).then((r) => r.data);
  },

  listMarkers(calendarUUID, year) {
    return http
      .get(`${MARKER_URL}?calendarUUID=${encodeURIComponent(calendarUUID)}&year=${year}`)
      .then((resp) => unwrapList(resp, "calendarDateMarker"));
  },

  createMarker(payload) {
    return http.post(MARKER_URL, payload).then((r) => r.data);
  },

  updateMarker(uuid, payload) {
    return http.put(`${MARKER_URL}/${uuid}`, payload).then((r) => r.data);
  },

  removeMarker(uuid) {
    return http.delete(`${MARKER_URL}/${uuid}`);
  },
};

export default CalendarService;
