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

const walk = (node, visit) => {
  if (Array.isArray(node)) return node.forEach((n) => walk(n, visit));
  if (!node || typeof node !== "object") return;
  visit(node);
  Object.values(node).forEach((n) => walk(n, visit));
};

const isAttachment = (n) => typeof n.data === "string" && typeof n.contentType === "string";

const isPdf = (n) => n.contentType.split(";")[0].trim().toLowerCase() === "application/pdf";

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
    walk(
      entries.map((e) => e.resource),
      (n) => {
        if (isAttachment(n) && n.data && isPdf(n)) {
          out.attachments.push({ title: n.title || "", contentType: n.contentType, data: n.data });
        }
      },
    );
  } catch {
    // never throw; return what we have
  }
  return out;
};

export const withoutAttachmentData = (bundle) => {
  const copy = JSON.parse(JSON.stringify(bundle === undefined ? null : bundle));
  walk(copy, (n) => {
    if (isAttachment(n)) n.data = `<base64, ${n.data.length} characters>`;
  });
  return copy;
};
