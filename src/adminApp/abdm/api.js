import { httpClient } from "../../common/utils/httpClient";

const B = "/web/abdm";
const post = (url, body) => httpClient.postJson(url, body).then((r) => r.data);

// Axios errors carry the server's {code, message} in response.data. Show the message plainly.
const textOf = (v) =>
  typeof v === "string" && v ? v : v && typeof v === "object" && typeof v.message === "string" ? v.message : undefined;

export const OFF_MESSAGE = "ABDM record sharing is off for this organisation";

export const errorMessage = (e) => {
  if (e && e.response && e.response.status === 404) return OFF_MESSAGE;
  const d = e && e.response && e.response.data;
  if (d && typeof d === "object") {
    const reason = textOf(d.message) || textOf(d.error) || textOf(d.code);
    const m = reason ? (d.hint ? `${d.hint} (${reason})` : reason) : d.hint || JSON.stringify(d);
    return d.abdmCode && !m.includes(d.abdmCode) ? `${m} (${d.abdmCode})` : m;
  }
  if (typeof d === "string" && d) return d;
  return (e && e.message) || String(e);
};

export const getStatus = () => httpClient.getData(`${B}/status`);
export const getHipPatients = () => httpClient.getData(`${B}/hip/patients`);
export const getCareContexts = (uuid) => httpClient.getData(`${B}/hip/subjects/${uuid}/care-contexts`);
export const linkSubject = (uuid) => post(`${B}/hip/subjects/${uuid}/link`, {});
export const createConsentRequest = (body) => post(`${B}/hiu/consent-requests`, body);
export const getConsentRequests = () => httpClient.getData(`${B}/hiu/consent-requests`);
export const getConsentRecords = (uuid) => httpClient.getData(`${B}/hiu/consent-requests/${uuid}/records`);
