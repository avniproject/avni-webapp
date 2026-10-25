// DEMO-ONLY abdm-hackathon
import { httpClient } from "../../common/utils/httpClient";

const B = "/web/abdm";
const post = (url, body) => httpClient.postJson(url, body).then((r) => r.data);

// Axios errors carry the server's {code, message} in response.data. Show the message plainly.
export const errorMessage = (e) => {
  const d = e && e.response && e.response.data;
  if (d && typeof d === "object") {
    const m = d.message || d.code || JSON.stringify(d);
    return d.abdmCode ? `${m} (${d.abdmCode})` : m;
  }
  if (typeof d === "string" && d) return d;
  return (e && e.message) || String(e);
};

export const getStatus = () => httpClient.getData(`${B}/status`);
export const registerBridgeUrl = () => post(`${B}/bridge-url`, {});
export const getBridgeServices = () => httpClient.getData(`${B}/bridge-services`);
export const getMessages = (limit = 100) => httpClient.getData(`${B}/messages?limit=${limit}`);
export const getHipPatients = () => httpClient.getData(`${B}/hip/patients`);
export const getCareContexts = (uuid) => httpClient.getData(`${B}/hip/subjects/${uuid}/care-contexts`);
export const linkSubject = (uuid) => post(`${B}/hip/subjects/${uuid}/link`, {});
export const getHipConsents = () => httpClient.getData(`${B}/hip/consents`);
export const createConsentRequest = (body) => post(`${B}/hiu/consent-requests`, body);
export const getConsentRequests = () => httpClient.getData(`${B}/hiu/consent-requests`);
export const getConsentRecords = (uuid) => httpClient.getData(`${B}/hiu/consent-requests/${uuid}/records`);
export const approveConsent = (id) => post(`${B}/mock/consent-requests/${id}/approve`, {});
export const denyConsent = (id) => post(`${B}/mock/consent-requests/${id}/deny`, {});
// Eka mode: Eka's sandbox approve call, standing in for the patient approving in their ABHA app.
export const approveConsentEka = (id) => post(`${B}/eka/consent-requests/${id}/approve`, {});
export const searchFacilities = (body) => post(`${B}/m4/facilities/search`, body);
export const searchProfessionals = (body) => post(`${B}/m4/professionals/search`, body);
export const submitFacility = (body) => post(`${B}/m4/facilities/submit`, body);
