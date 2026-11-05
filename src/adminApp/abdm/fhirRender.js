// DEMO-ONLY abdm-hackathon
// Reads a FHIR document bundle received from another system for the Records received view. The bundle can carry any
// shape, so nothing here throws and nothing it returns is other than text: a value that is not text or a number is
// left blank, never handed to React raw.
const first = (...vals) => vals.find((v) => v !== undefined && v !== null && v !== "");
const arr = (v) => (Array.isArray(v) ? v : []);
// Text, or "" for anything else (an object where text belongs, a boolean, nothing at all).
const text = (v) => (typeof v === "string" ? v : typeof v === "number" ? String(v) : "");
// The first of these that reads as text.
const pick = (...vals) => vals.map(text).find((v) => v !== "") || "";
// Parts left out when missing: never written as "false" or "undefined".
const joined = (parts, sep = " · ") =>
  parts
    .map(text)
    .filter((p) => p !== "")
    .join(sep);

// The words of a CodeableConcept: its text, else its first coding's display, else that code.
const codeText = (c) => {
  if (!c || typeof c !== "object") return "";
  const coding = arr(c.coding)[0] || {};
  return pick(c.text, coding.display, coding.code);
};

const quantity = (q) => (q && typeof q === "object" ? joined([q.value, first(q.unit, q.code)], " ") : "");

const observationValue = (o) => {
  if (!o || typeof o !== "object") return "";
  if (o.valueQuantity) return quantity(o.valueQuantity);
  if (o.valueRange) return joined([quantity(o.valueRange.low), quantity(o.valueRange.high)], " to ");
  if (o.valueRatio) return joined([quantity(o.valueRatio.numerator), quantity(o.valueRatio.denominator)], " / ");
  if (o.valuePeriod) return joined([o.valuePeriod.start, o.valuePeriod.end], " to ");
  const v = pick(
    o.valueCodeableConcept && codeText(o.valueCodeableConcept),
    o.valueString,
    o.valueDateTime,
    o.valueInteger,
    typeof o.valueBoolean === "boolean" ? String(o.valueBoolean) : undefined,
  );
  if (v !== "") return v;
  // A panel, such as blood pressure: each part with its own value.
  return arr(o.component)
    .filter((c) => c && typeof c === "object")
    .map((c) => joined([codeText(c.code), observationValue(c)], " "))
    .filter(Boolean)
    .join(", ");
};

const walk = (node, visit) => {
  if (Array.isArray(node)) return node.forEach((n) => walk(n, visit));
  if (!node || typeof node !== "object") return;
  visit(node);
  Object.values(node).forEach((n) => walk(n, visit));
};

const isAttachment = (n) => typeof n.data === "string" && typeof n.contentType === "string";
const mediaType = (n) => n.contentType.split(";")[0].trim().toLowerCase();
const isPdf = (n) => mediaType(n) === "application/pdf";
// Raster images only: an SVG can carry script.
const isImage = (n) => ["image/jpeg", "image/png"].includes(mediaType(n));
const base64Bytes = (data) => Math.max(0, Math.floor((data.length * 3) / 4) - (data.endsWith("==") ? 2 : data.endsWith("=") ? 1 : 0));

// NRCES record profiles, named as a health worker would say them.
const RECORD_TYPES = {
  OPConsultRecord: "Consultation",
  PrescriptionRecord: "Prescription",
  DiagnosticReportRecord: "Diagnostic report",
  DischargeSummaryRecord: "Discharge summary",
  ImmunizationRecord: "Immunisation record",
  HealthDocumentRecord: "Health document",
  WellnessRecord: "Wellness record",
  InvoiceRecord: "Invoice",
};
// A record without its profile is known by the Composition's type: NRCES's SNOMED CT code, else its exact text (the
// wellness and invoice records carry no code).
const RECORD_TYPE_CODES = {
  371530004: "Consultation",
  440545006: "Prescription",
  721981007: "Diagnostic report",
  373942005: "Discharge summary",
  41000179103: "Immunisation record",
  419891008: "Health document",
};
const RECORD_TYPE_TEXTS = { "op consultation record": "Consultation", "wellness record": "Wellness record", "invoice record": "Invoice" };

const recordType = (comp) => {
  if (!comp) return "";
  for (const p of arr(comp.meta && comp.meta.profile)) {
    const name = text(p).split("/").pop();
    if (RECORD_TYPES[name]) return RECORD_TYPES[name];
  }
  for (const c of arr(comp.type && comp.type.coding)) {
    if (c && RECORD_TYPE_CODES[c.code]) return RECORD_TYPE_CODES[c.code];
  }
  const t = codeText(comp.type);
  return RECORD_TYPE_TEXTS[t.trim().toLowerCase()] || t;
};

const money = (m) => (m && typeof m === "object" ? joined([m.value, m.currency], " ") : "");
const dose = (d) => {
  const n = d && typeof d === "object" ? pick(d.doseNumberPositiveInt, d.doseNumberString) : "";
  return n ? `dose ${n}` : "";
};

// One entry of a record, as {kind, label, value} and, for a lab report or an invoice, its parts as children. A lab
// report's results are followed into measurements only, so a report can never expand into itself or into others.
// A narrative (text.div) is never read: it is HTML from another system.
const describe = (r, byUrl) => {
  const ref = (x) => (x && typeof x === "object" && typeof x.reference === "string" ? byUrl[x.reference] : undefined);
  const item = (kind, label, value, children) => {
    const out = { kind: text(kind), label: text(label) || text(kind), value: text(value) };
    if (children && children.length) out.children = children;
    return out;
  };
  switch (r.resourceType) {
    case "Observation":
      return item("Observation", codeText(r.code) || "Observation", observationValue(r));
    case "DiagnosticReport":
      return item(
        "Report",
        codeText(r.code),
        joined([r.status, r.conclusion]),
        arr(r.result)
          .map(ref)
          .filter((o) => o && o.resourceType === "Observation")
          .map((o) => item("Observation", codeText(o.code) || "Observation", observationValue(o))),
      );
    case "MedicationRequest":
    case "MedicationStatement": {
      const med = ref(r.medicationReference);
      const doses = arr(r.dosageInstruction)
        .concat(arr(r.dosage))
        .map((d) => d && d.text);
      return item("Medicine", pick(codeText(r.medicationCodeableConcept), med && codeText(med.code)), joined(doses, "; "));
    }
    case "Immunization":
      return item(
        "Vaccination",
        codeText(r.vaccineCode),
        joined([
          pick(r.occurrenceDateTime, r.occurrenceString),
          text(r.lotNumber) && `lot ${r.lotNumber}`,
          dose(arr(r.protocolApplied)[0]),
        ]),
      );
    case "ImmunizationRecommendation": {
      const next = arr(r.recommendation).find((x) => x && typeof x === "object") || {};
      const due = arr(next.dateCriterion).find((x) => x && typeof x === "object");
      return item(
        "Next dose",
        codeText(arr(next.vaccineCode)[0]),
        joined([dose(next), due && text(due.value) && `due ${due.value}`, codeText(next.forecastStatus)]),
      );
    }
    case "Condition":
      return item("Condition", codeText(r.code), codeText(r.clinicalStatus));
    case "Procedure":
      return item(
        "Procedure",
        codeText(r.code),
        joined([r.status, pick(r.performedDateTime, r.performedPeriod && r.performedPeriod.start)]),
      );
    case "AllergyIntolerance":
      return item("Allergy", codeText(r.code), codeText(r.clinicalStatus));
    case "CarePlan":
      return item("Care plan", pick(r.title, codeText(arr(r.category)[0])), r.description);
    case "Appointment":
      return item(
        "Appointment",
        pick(codeText(arr(r.serviceType)[0]), codeText(r.appointmentType), r.description),
        joined([r.status, r.start]),
      );
    case "ServiceRequest":
      return item("Order", codeText(r.code) || "Service request", joined([r.status, r.intent]));
    case "Specimen":
      return item("Specimen", codeText(r.type), pick(r.receivedTime, r.collection && r.collection.collectedDateTime));
    case "Invoice":
      return item(
        "Invoice",
        codeText(r.type) || "Invoice",
        joined([money(r.totalNet) && `net ${money(r.totalNet)}`, money(r.totalGross) && `gross ${money(r.totalGross)}`, r.status]),
        arr(r.lineItem)
          .filter((li) => li && typeof li === "object")
          .map((li) => {
            const charge = ref(li.chargeItemReference);
            const product = charge && ref(charge.productReference);
            const label =
              pick(product && codeText(product.code), charge && codeText(charge.code), codeText(li.chargeItemCodeableConcept)) || "Line";
            const prices = arr(li.priceComponent)
              .filter((p) => p && typeof p === "object")
              .map((p) => joined([codeText(p.code) || p.type, money(p.amount)], " "));
            return item("Line", label, joined([charge && quantity(charge.quantity), ...prices], ", "));
          }),
      );
    case "DocumentReference": {
      const files = arr(r.content)
        .map((c) => c && c.attachment)
        .filter((a) => a && typeof a === "object");
      return item(
        "Document",
        pick(codeText(r.type), r.description, files[0] && files[0].title) || "Document",
        joined([r.date, ...files.map((f) => f.contentType)]),
      );
    }
    case "Binary":
      return item("Document", "File", r.contentType);
    case "Media":
      return item("Image", codeText(r.modality) || "Image", r.content && r.content.contentType);
    case "ImagingStudy": {
      const series = arr(r.series)[0];
      return item(
        "Imaging study",
        pick(r.description, codeText(arr(r.procedureCode)[0]), series && series.modality && series.modality.code) || "Imaging study",
        joined([
          typeof r.numberOfSeries === "number" && `${r.numberOfSeries} series`,
          typeof r.numberOfInstances === "number" && `${r.numberOfInstances} images`,
        ]),
      );
    }
    case "Encounter":
      return item("Visit", pick(codeText(r.class), r.class && r.class.display), r.period && r.period.start);
    default: {
      const type = text(r.resourceType) || "Entry";
      return item(type, codeText(r.code) || type, "");
    }
  }
};

// One entry that cannot be read costs only itself.
const describeSafely = (r, byUrl) => {
  try {
    return describe(r, byUrl);
  } catch {
    const type = text(r && r.resourceType) || "Entry";
    return { kind: type, label: type, value: "Could not be read" };
  }
};

export const summariseBundle = (bundle) => {
  const out = { title: "", recordType: "", date: "", patientName: "", hipName: "", rows: [], sections: [], attachments: [], images: [] };
  let entries = [];
  const byUrl = {};
  let comp;
  try {
    entries = (bundle && Array.isArray(bundle.entry) ? bundle.entry : []).filter((e) => e && e.resource && typeof e.resource === "object");
    entries.forEach((e) => {
      if (typeof e.fullUrl === "string") byUrl[e.fullUrl] = e.resource;
    });
    const ofType = (t) => entries.map((e) => e.resource).filter((r) => r.resourceType === t);
    comp = entries.length && entries[0].resource.resourceType === "Composition" ? entries[0].resource : ofType("Composition")[0];
    out.title = text(comp && comp.title);
    out.recordType = recordType(comp);
    out.date = pick(comp && comp.date, bundle && bundle.timestamp);
    const patient = ofType("Patient")[0];
    const pn = patient && arr(patient.name)[0];
    out.patientName = (pn && pick(pn.text, [].concat(arr(pn.given).map(text), text(pn.family)).filter(Boolean).join(" "))) || "";
    // The HIP is the record's custodian, else an organisation that wrote it, else the first one named.
    const asOrg = (x) => {
      const r = x && typeof x.reference === "string" && byUrl[x.reference];
      return r && r.resourceType === "Organization" ? r : undefined;
    };
    const org = first(comp && asOrg(comp.custodian), comp && arr(comp.author).map(asOrg).find(Boolean), ofType("Organization")[0]);
    out.hipName = text(org && org.name);
  } catch {
    // never throw; return what we have
  }
  // The attachments first and on their own, so nothing in the sections can hide a record's PDF.
  try {
    walk(
      entries.map((e) => e.resource),
      (n) => {
        if (!isAttachment(n) || !n.data) return;
        const file = { title: text(n.title), contentType: n.contentType, data: n.data, size: base64Bytes(n.data) };
        if (isPdf(n)) out.attachments.push(file);
        else if (isImage(n)) out.images.push(file);
      },
    );
  } catch {
    // never throw
  }
  try {
    let observations = [];
    if (comp && Array.isArray(comp.section)) {
      comp.section.forEach((s) => {
        if (!s || typeof s !== "object") return;
        const resources = arr(s.entry)
          .map((en) => en && typeof en.reference === "string" && byUrl[en.reference])
          .filter(Boolean);
        resources.filter((r) => r.resourceType === "Observation").forEach((r) => observations.push(r));
        const items = resources.map((r) => describeSafely(r, byUrl));
        if (items.length) out.sections.push({ title: pick(s.title, codeText(s.code)) || "Section", items });
      });
    }
    if (observations.length === 0) observations = entries.map((e) => e.resource).filter((r) => r.resourceType === "Observation");
    out.rows = observations.map((o) => ({
      label: codeText(o.code) || "Observation",
      value: observationValue(o),
    }));
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
