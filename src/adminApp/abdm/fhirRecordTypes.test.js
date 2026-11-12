// M3, HIU_FLOW_107 to 114: each ABDM record type is shown readably, structured and as a document. The fixtures are the
// sample records Avni's clinic side serves (avni-server SampleRecords, built from NRCES's examples for a made-up
// "Test Patient"), as they arrive at the HIU.
import { summariseBundle } from "./fhirRender";
import opSample from "./__fixtures__/op-consultation-sample.json";
import diagnostic from "./__fixtures__/samples/DiagnosticReport.json";
import diagnosticDoc from "./__fixtures__/samples/DiagnosticReport-document.json";
import prescription from "./__fixtures__/samples/Prescription.json";
import prescriptionDoc from "./__fixtures__/samples/Prescription-document.json";
import discharge from "./__fixtures__/samples/DischargeSummary.json";
import dischargeDoc from "./__fixtures__/samples/DischargeSummary-document.json";
import immunisation from "./__fixtures__/samples/ImmunizationRecord.json";
import immunisationDoc from "./__fixtures__/samples/ImmunizationRecord-document.json";
import healthImage from "./__fixtures__/samples/HealthDocumentRecord.json";
import healthDoc from "./__fixtures__/samples/HealthDocumentRecord-document.json";
import wellness from "./__fixtures__/samples/WellnessRecord.json";
import wellnessDoc from "./__fixtures__/samples/WellnessRecord-document.json";
import invoice from "./__fixtures__/samples/Invoice.json";

const items = (s) => s.sections.flatMap((x) => x.items);
const item = (s, label) => items(s).find((i) => i.label === label);
const sectionTitles = (s) => s.sections.map((x) => x.title);

const ALL = {
  diagnostic,
  diagnosticDoc,
  prescription,
  prescriptionDoc,
  discharge,
  dischargeDoc,
  immunisation,
  immunisationDoc,
  healthImage,
  healthDoc,
  wellness,
  wellnessDoc,
  invoice,
};

describe("every record type", () => {
  it("names its type, the patient and the date, whatever the type", () => {
    const types = {
      diagnostic: "Diagnostic report",
      diagnosticDoc: "Diagnostic report",
      prescription: "Prescription",
      prescriptionDoc: "Prescription",
      discharge: "Discharge summary",
      dischargeDoc: "Discharge summary",
      immunisation: "Immunisation record",
      immunisationDoc: "Immunisation record",
      healthImage: "Health document",
      healthDoc: "Health document",
      wellness: "Wellness record",
      wellnessDoc: "Wellness record",
      invoice: "Invoice",
    };
    Object.entries(ALL).forEach(([name, b]) => {
      const s = summariseBundle(b);
      expect([name, s.recordType]).toEqual([name, types[name]]);
      expect([name, s.patientName]).toEqual([name, "Test Patient"]);
      expect([name, s.title.endsWith("(test data)")]).toEqual([name, true]);
      expect([name, s.date.length > 0]).toEqual([name, true]);
    });
    expect(summariseBundle(opSample).recordType).toBe("Consultation");
  });

  it("the structured form lists its sections, and every entry is named", () => {
    [diagnostic, prescription, discharge, immunisation, wellness, invoice].forEach((b) => {
      const s = summariseBundle(b);
      expect(s.sections.length).toBeGreaterThan(0);
      items(s).forEach((i) => expect(i.label).toBeTruthy());
      expect(s.attachments).toEqual([]);
      expect(s.images).toEqual([]);
    });
  });

  it("the document form carries its PDF, the health document also an image", () => {
    [diagnosticDoc, prescriptionDoc, dischargeDoc, immunisationDoc, healthDoc, wellnessDoc].forEach((b) => {
      const s = summariseBundle(b);
      expect(s.attachments.length).toBe(1);
      expect(s.attachments[0].contentType).toBe("application/pdf");
      expect(s.attachments[0].size).toBeGreaterThan(0);
    });
    const image = summariseBundle(healthImage);
    expect(image.images.length).toBe(1);
    expect(image.images[0].contentType).toBe("image/jpeg");
    expect(image.attachments).toEqual([]);
  });
});

describe("each record type reads as itself", () => {
  it("HIU_FLOW_107, a diagnostic report: the test, its status and conclusion", () => {
    const s = summariseBundle(diagnostic);
    const report = item(s, "CT Head and Neck WO contrast");
    expect(report.kind).toBe("Report");
    expect(report.value).toContain("CT brains: large tumor sphenoid/clivus.");
    expect(report.value).toContain("final");
  });

  it("HIU_FLOW_108, a prescription: each medicine with its dose", () => {
    const s = summariseBundle(prescription);
    expect(item(s, "Azithromycin 250 mg oral tablet")).toMatchObject({
      kind: "Medicine",
      value: expect.stringContaining("One tablet at once"),
    });
    expect(item(s, "Paracetemol 500mg Oral Tab").value).toContain("Take two tablets orally");
  });

  it("HIU_FLOW_109, a discharge summary: its sections, procedures, care plan and lab results", () => {
    const s = summariseBundle(discharge);
    expect(sectionTitles(s)).toEqual(["Chief complaints", "Medical History", "Investigations", "Procedures", "Medications", "Care Plan"]);
    expect(item(s, "Placement of stent in coronary artery").kind).toBe("Procedure");
    expect(item(s, "Coronary heart disease care plan").kind).toBe("Care plan");
    const lipids = item(s, "Lipid 1996 panel");
    expect(lipids.children.length).toBe(3);
    expect(lipids.children.map((c) => c.label)).toContain("Cholesterol [Mass/volume] in Serum or Plasma");
    expect(lipids.children.find((c) => c.label.startsWith("Cholesterol")).value).toBe("156 mg/dL");
  });

  it("HIU_FLOW_111, an immunisation record: the vaccine, date, lot, and the next dose", () => {
    const s = summariseBundle(immunisation);
    const given = items(s).find((i) => i.kind === "Vaccination");
    expect(given.label).toBe("COVID-19 antigen vaccine");
    expect(given.value).toContain("2021-02-21");
    expect(given.value).toContain("BSCD12344SS");
    expect(items(s).find((i) => i.kind === "Next dose").label).toBe("COVID-19 antigen vaccine");
    expect(s.hipName).toBe("TANUH Health Centre");
  });

  it("HIU_FLOW_112, a health document: the document and its file", () => {
    const s = summariseBundle(healthDoc);
    expect(items(s).some((i) => i.kind === "Document")).toBe(true);
  });

  it("HIU_FLOW_113, a wellness record: its sections, and the blood pressure panel in full", () => {
    const s = summariseBundle(wellness);
    expect(sectionTitles(s)).toEqual([
      "Vital Signs",
      "Body Measurement",
      "Physical Activity",
      "General Assessment",
      "Women Health",
      "Lifestyle",
    ]);
    expect(item(s, "Heart rate").value).toBe("44 beats/minute");
    const bp = item(s, "Blood pressure panel with all children optional").value;
    expect(bp).toContain("Systolic blood pressure");
    expect(bp).toMatch(/mm\[?Hg/);
    expect(item(s, "Diet [Type]").value).toBe("Vegan diet");
  });

  it("HIU_FLOW_114, an invoice: the totals and each line with its medicine", () => {
    const s = summariseBundle(invoice);
    const bill = items(s).find((i) => i.kind === "Invoice");
    expect(bill.label).toBe("Pharmacy");
    expect(bill.value).toContain("2752.2 INR");
    expect(bill.value).toContain("issued");
    expect(bill.children.map((c) => c.label)).toContain("Paracetamol 1 g oral tablet");
    bill.children.forEach((c) => expect(c.value).toMatch(/INR/));
  });
});

describe("reading never goes wrong", () => {
  it("other value types read as text", () => {
    const obs = (extra) => ({
      entry: [
        {
          fullUrl: "urn:uuid:c",
          resource: { resourceType: "Composition", section: [{ title: "S", entry: [{ reference: "urn:uuid:o" }] }] },
        },
        { fullUrl: "urn:uuid:o", resource: { resourceType: "Observation", code: { text: "X" }, ...extra } },
      ],
    });
    const value = (extra) => item(summariseBundle(obs(extra)), "X").value;
    expect(value({ valueInteger: 7 })).toBe("7");
    expect(value({ valueRange: { low: { value: 1, unit: "mg" }, high: { value: 3, unit: "mg" } } })).toBe("1 mg to 3 mg");
    expect(value({ valueRatio: { numerator: { value: 1 }, denominator: { value: 2 } } })).toBe("1 / 2");
    expect(value({ valuePeriod: { start: "2026-01-01", end: "2026-01-05" } })).toBe("2026-01-01 to 2026-01-05");
  });

  it("an unknown resource is named by its type, and a narrative is never read", () => {
    const b = {
      entry: [
        {
          fullUrl: "urn:uuid:c",
          resource: { resourceType: "Composition", section: [{ title: "S", entry: [{ reference: "urn:uuid:x" }] }] },
        },
        { fullUrl: "urn:uuid:x", resource: { resourceType: "RiskAssessment", text: { div: "<div><script>x</script></div>" } } },
      ],
    };
    const s = summariseBundle(b);
    expect(items(s)).toEqual([{ kind: "RiskAssessment", label: "RiskAssessment", value: "" }]);
    expect(JSON.stringify(s)).not.toContain("script");
  });

  it("an image other than JPEG or PNG is never shown", () => {
    const of = (contentType) => ({
      entry: [{ resource: { resourceType: "DocumentReference", content: [{ attachment: { contentType, data: "PHN2Zz4=" } }] } }],
    });
    expect(summariseBundle(of("image/svg+xml")).images).toEqual([]);
    expect(summariseBundle(of("image/png")).images.length).toBe(1);
  });

  it("never throws, on anything", () => {
    [
      undefined,
      null,
      {},
      "x",
      { entry: [null, {}, { resource: { resourceType: "Composition", section: [null, { entry: [null] }] } }] },
    ].forEach((b) => {
      const s = summariseBundle(b);
      expect(s.sections).toEqual([]);
      expect(s.images).toEqual([]);
      expect(s.recordType).toBe("");
    });
  });
});

describe("records from other systems, odd but possible", () => {
  const record = (...resources) => ({
    entry: [
      {
        fullUrl: "urn:uuid:c",
        resource: {
          resourceType: "Composition",
          title: "T",
          section: [{ title: "S", entry: resources.map((_, i) => ({ reference: `urn:uuid:r${i}` })) }],
        },
      },
      ...resources.map((r, i) => ({ fullUrl: `urn:uuid:r${i}`, resource: r })),
    ],
  });

  it("a missing part never reads as the word false", () => {
    const s = summariseBundle(
      record(
        {
          resourceType: "ImmunizationRecommendation",
          recommendation: [{ vaccineCode: [{ text: "BCG" }], doseNumberString: "booster", dateCriterion: [{ value: "2026-12-01" }] }],
        },
        {
          resourceType: "ImmunizationRecommendation",
          recommendation: [{ vaccineCode: [{ text: "OPV" }], dateCriterion: [{ value: "2026-12-02" }] }],
        },
        { resourceType: "ImagingStudy", description: "CT", numberOfInstances: 40 },
        { resourceType: "Immunization", vaccineCode: { text: "DPT" }, occurrenceDateTime: "2026-01-01", protocolApplied: [{}] },
      ),
    );
    const values = items(s).map((i) => i.value);
    values.forEach((v) => expect(v).not.toContain("false"));
    expect(values[0]).toBe("dose booster · due 2026-12-01");
    expect(values[1]).toBe("due 2026-12-02");
    expect(values[2]).toBe("40 images");
    expect(values[3]).toBe("2026-01-01");
  });

  it("a field that should be text but is not is left blank, never shown raw", () => {
    const b = record(
      { resourceType: "CarePlan", title: { odd: 1 }, description: { odd: 2 } },
      { resourceType: "Condition", code: { text: { odd: 3 } } },
      { resourceType: "Encounter", class: { display: 7 }, period: { start: { odd: 4 } } },
    );
    b.entry[0].resource.title = { odd: 5 };
    b.entry[0].resource.section[0].title = { odd: 6 };
    const s = summariseBundle(b);
    expect(s.title).toBe("");
    expect(s.sections[0].title).toBe("Section");
    items(s).forEach((i) => {
      expect(typeof i.label).toBe("string");
      expect(typeof i.value).toBe("string");
    });
    expect(JSON.stringify(s)).not.toContain("odd");
  });

  it("a lab report pointing at itself, or at others over and over, stays small and keeps the rest", () => {
    const self = { resourceType: "DiagnosticReport", code: { text: "Loop" }, result: [{ reference: "urn:uuid:r0" }] };
    const reports = Array.from({ length: 22 }, (_, i) => ({
      resourceType: "DiagnosticReport",
      code: { text: `R${i}` },
      result: [{ reference: `urn:uuid:r${i + 1}` }, { reference: `urn:uuid:r${i + 1}` }],
    }));
    [
      record(self, { resourceType: "DocumentReference", content: [{ attachment: { contentType: "application/pdf", data: "JVBERi0x" } }] }),
      record(...reports),
    ].forEach((b) => {
      const s = summariseBundle(b);
      expect(JSON.stringify(s).length).toBeLessThan(20000);
    });
    expect(
      summariseBundle(
        record(self, {
          resourceType: "DocumentReference",
          content: [{ attachment: { contentType: "application/pdf", data: "JVBERi0x" } }],
        }),
      ).attachments.length,
    ).toBe(1);
  });

  it("one unreadable entry costs only itself: the rest and the PDF still show", () => {
    const s = summariseBundle(
      record(
        { resourceType: "Invoice", type: { text: "Pharmacy" }, lineItem: [null, { priceComponent: [null] }] },
        {
          resourceType: "Observation",
          code: { text: "BP" },
          component: [null, { code: { text: "Systolic" }, valueQuantity: { value: 120, unit: "mmHg" } }],
        },
        { resourceType: "DocumentReference", content: [{ attachment: { contentType: "application/pdf", data: "JVBERi0x" } }] },
      ),
    );
    expect(items(s).map((i) => i.label)).toEqual(["Pharmacy", "BP", "Document"]);
    expect(item(s, "BP").value).toBe("Systolic 120 mmHg");
    expect(s.attachments.length).toBe(1);
  });

  it("a type code that is a number is read, not crashed on", () => {
    const b = record();
    b.entry[0].resource.type = { coding: [{ code: 12345 }] };
    expect(summariseBundle(b).recordType).toBe("12345");
  });
});

describe("review holds of 5 Nov", () => {
  const bundleOf = (sections, ...resources) => ({
    entry: [
      { fullUrl: "urn:uuid:c", resource: { resourceType: "Composition", title: "T", section: sections } },
      ...resources.map(([url, r]) => ({ fullUrl: url, resource: r })),
    ],
  });

  // Hold 3: a name from the record is looked up only among our own names, never an object's built-in ones.
  it("a type named like a built-in property reads as text and never crashes the page", () => {
    ["__proto__", "constructor", "toString", "hasOwnProperty"].forEach((odd) => {
      const viaCode = bundleOf([]);
      viaCode.entry[0].resource.type = { coding: [{ code: odd }] };
      const viaText = bundleOf([]);
      viaText.entry[0].resource.type = { text: odd };
      const viaProfile = bundleOf([]);
      viaProfile.entry[0].resource.meta = { profile: [`https://example.org/StructureDefinition/${odd}`] };
      [viaCode, viaText, viaProfile].forEach((b) => expect(typeof summariseBundle(b).recordType).toBe("string"));
      expect(summariseBundle(viaText).recordType).toBe(odd);
    });
  });

  // Hold 4: everything the old view listed is still on the page.
  it("a lab report's grouped results show under their panel", () => {
    const s = summariseBundle(
      bundleOf(
        [{ title: "Lab", entry: [{ reference: "urn:uuid:dr" }] }],
        [
          "urn:uuid:dr",
          { resourceType: "DiagnosticReport", code: { text: "CBC" }, status: "final", result: [{ reference: "urn:uuid:panel" }] },
        ],
        [
          "urn:uuid:panel",
          {
            resourceType: "Observation",
            code: { text: "CBC panel" },
            hasMember: [{ reference: "urn:uuid:hb" }, { reference: "urn:uuid:wbc" }],
          },
        ],
        ["urn:uuid:hb", { resourceType: "Observation", code: { text: "Haemoglobin" }, valueQuantity: { value: 13.2, unit: "g/dL" } }],
        ["urn:uuid:wbc", { resourceType: "Observation", code: { text: "WBC" }, valueQuantity: { value: 7000, unit: "/uL" } }],
      ),
    );
    const text = JSON.stringify(s.sections);
    expect(text).toContain("13.2 g/dL");
    expect(text).toContain("7000 /uL");
    expect(s.sections.map((x) => x.title)).toEqual(["Lab"]);
  });

  it("a reference written as type and id finds its entry", () => {
    const s = summariseBundle(
      bundleOf(
        [{ title: "Lab", entry: [{ reference: "DiagnosticReport/dr1" }] }],
        [
          "urn:uuid:1",
          { resourceType: "DiagnosticReport", id: "dr1", code: { text: "Glucose test" }, result: [{ reference: "Observation/g1" }] },
        ],
        ["urn:uuid:2", { resourceType: "Observation", id: "g1", code: { text: "Glucose" }, valueQuantity: { value: 110, unit: "mg/dL" } }],
      ),
    );
    expect(item(s, "Glucose test").children.map((c) => c.value)).toEqual(["110 mg/dL"]);
  });

  it("a section inside a section is read, under both titles", () => {
    const s = summariseBundle(
      bundleOf(
        [
          { title: "Chief complaints", entry: [{ reference: "urn:uuid:c1" }] },
          { title: "Examination", section: [{ title: "Vitals", entry: [{ reference: "urn:uuid:t" }] }] },
        ],
        ["urn:uuid:c1", { resourceType: "Condition", code: { text: "Fever" } }],
        ["urn:uuid:t", { resourceType: "Observation", code: { text: "Temperature" }, valueQuantity: { value: 101, unit: "F" } }],
      ),
    );
    expect(s.sections.map((x) => x.title)).toEqual(["Chief complaints", "Examination › Vitals"]);
    expect(item(s, "Temperature").value).toBe("101 F");
  });

  it("a measurement no section reaches is listed at the end, not lost", () => {
    const s = summariseBundle(
      bundleOf(
        [{ title: "Chief complaints", entry: [{ reference: "urn:uuid:c1" }] }],
        ["urn:uuid:c1", { resourceType: "Condition", code: { text: "Fever" } }],
        ["urn:uuid:p", { resourceType: "Observation", code: { text: "Pulse" }, valueQuantity: { value: 88, unit: "/min" } }],
      ),
    );
    expect(s.sections.map((x) => x.title)).toEqual(["Chief complaints", "Other measurements"]);
    expect(item(s, "Pulse").value).toBe("88 /min");
  });

  it("a panel that names itself among its members stays small", () => {
    const s = summariseBundle(
      bundleOf(
        [{ title: "Lab", entry: [{ reference: "urn:uuid:loop" }] }],
        ["urn:uuid:loop", { resourceType: "Observation", code: { text: "Loop" }, hasMember: [{ reference: "urn:uuid:loop" }] }],
      ),
    );
    expect(JSON.stringify(s).length).toBeLessThan(2000);
  });

  // W6: an entry that throws while it is read costs only itself; the rest, and the PDF, still show.
  it("an entry that throws when read costs only itself", () => {
    const bad = { resourceType: "Condition" };
    Object.defineProperty(bad, "code", {
      enumerable: true,
      get() {
        throw new Error("odd entry");
      },
    });
    const s = summariseBundle(
      bundleOf(
        [{ title: "S", entry: [{ reference: "urn:uuid:bad" }, { reference: "urn:uuid:ok" }, { reference: "urn:uuid:doc" }] }],
        ["urn:uuid:bad", bad],
        ["urn:uuid:ok", { resourceType: "Observation", code: { text: "BP" }, valueString: "120/80" }],
        [
          "urn:uuid:doc",
          { resourceType: "DocumentReference", content: [{ attachment: { contentType: "application/pdf", data: "JVBERi0x" } }] },
        ],
      ),
    );
    expect(items(s).map((i) => [i.label, i.value])).toEqual([
      ["Condition", "Could not be read"],
      ["BP", "120/80"],
      ["Document", "application/pdf"],
    ]);
    expect(s.attachments.length).toBe(1);
  });
});
