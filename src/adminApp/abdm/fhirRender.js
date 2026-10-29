// DEMO-ONLY abdm-hackathon
const first = (...vals) => vals.find((v) => v !== undefined && v !== null && v !== "");

const observationValue = (o) => {
  if (!o) return "";
  if (o.valueQuantity) return [o.valueQuantity.value, o.valueQuantity.unit].filter((v) => v !== undefined && v !== null).join(" ");
  const v = first(
    o.valueCodeableConcept &&
      (o.valueCodeableConcept.text ||
        (o.valueCodeableConcept.coding && o.valueCodeableConcept.coding[0] && o.valueCodeableConcept.coding[0].display)),
    o.valueString,
    o.valueDateTime,
    o.valueBoolean === undefined ? undefined : String(o.valueBoolean),
  );
  return v === undefined ? "" : String(v);
};

export const summariseBundle = (bundle) => {
  const out = { title: "", date: "", patientName: "", hipName: "", rows: [], attachments: [] };
  try {
    const entries = (bundle && Array.isArray(bundle.entry) ? bundle.entry : []).filter((e) => e && e.resource);
    const byUrl = {};
    entries.forEach((e) => {
      if (e.fullUrl) byUrl[e.fullUrl] = e.resource;
    });
    const ofType = (t) => entries.map((e) => e.resource).filter((r) => r.resourceType === t);
    const comp = entries.length && entries[0].resource.resourceType === "Composition" ? entries[0].resource : ofType("Composition")[0];
    out.title = (comp && comp.title) || "";
    out.date = first(comp && comp.date, bundle && bundle.timestamp) || "";
    const patient = ofType("Patient")[0];
    const pn = patient && patient.name && patient.name[0];
    out.patientName = (pn && (pn.text || [].concat(pn.given || [], pn.family || []).join(" "))) || "";
    const org = ofType("Organization")[0];
    out.hipName = (org && org.name) || "";

    let observations = [];
    if (comp && Array.isArray(comp.section)) {
      comp.section.forEach((s) =>
        (s.entry || []).forEach((en) => {
          const r = en && byUrl[en.reference];
          if (r && r.resourceType === "Observation") observations.push(r);
        }),
      );
    }
    if (observations.length === 0) observations = ofType("Observation");
    out.rows = observations.map((o) => ({
      label: (o.code && (o.code.text || (o.code.coding && o.code.coding[0] && o.code.coding[0].display))) || "Observation",
      value: observationValue(o),
    }));
    // The PDF copy each record carries (FhirBundleBuilder writes it as a DocumentReference attachment).
    ofType("DocumentReference").forEach((d) =>
      (Array.isArray(d.content) ? d.content : []).forEach((c) => {
        const a = c && c.attachment;
        if (a && typeof a.data === "string" && a.data) {
          out.attachments.push({ title: a.title || "", contentType: a.contentType || "", data: a.data });
        }
      }),
    );
  } catch {
    // never throw; return what we have
  }
  return out;
};

// The bundle as the raw view shows it: every attachment's base64 replaced by its length, so a PDF copy does not fill
// the page. The bundle given is not changed.
export const withoutAttachmentData = (bundle) => {
  const copy = JSON.parse(JSON.stringify(bundle === undefined ? null : bundle));
  const strip = (node) => {
    if (Array.isArray(node)) return node.forEach(strip);
    if (!node || typeof node !== "object") return;
    if (node.attachment && typeof node.attachment.data === "string") {
      node.attachment.data = `<base64, ${node.attachment.data.length} characters>`;
    }
    Object.values(node).forEach(strip);
  };
  strip(copy);
  return copy;
};
