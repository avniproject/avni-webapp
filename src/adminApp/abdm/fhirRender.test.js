// DEMO-ONLY abdm-hackathon
import { summariseBundle, withoutAttachmentData } from "./fhirRender";
import sample from "./__fixtures__/op-consultation-sample.json";

describe("summariseBundle", () => {
  it("reads the sample bundle", () => {
    const s = summariseBundle(sample);
    expect(s.title).toBe("Hypertension Screening — TANUH Health Centre");
    expect(s.patientName).toBe("Anita Devi");
    expect(s.hipName).toBe("TANUH Health Centre");
    expect(s.date).toContain("2026-10-20");
    expect(s.rows).toEqual([
      { label: "Systolic BP", value: "130 mmHg" },
      { label: "Diastolic BP", value: "85 mmHg" },
      { label: "Tobacco use", value: "Yes" },
    ]);
  });

  it("handles other value types", () => {
    const b = {
      entry: [
        {
          fullUrl: "urn:uuid:1",
          resource: {
            resourceType: "Composition",
            section: [{ entry: [{ reference: "urn:uuid:2" }, { reference: "urn:uuid:3" }, { reference: "urn:uuid:missing" }] }],
          },
        },
        { fullUrl: "urn:uuid:2", resource: { resourceType: "Observation", code: { text: "Note" }, valueString: "ok" } },
        { fullUrl: "urn:uuid:3", resource: { resourceType: "Observation", code: { text: "Fasting" }, valueBoolean: false } },
      ],
    };
    expect(summariseBundle(b).rows).toEqual([
      { label: "Note", value: "ok" },
      { label: "Fasting", value: "false" },
    ]);
  });

  it("never throws on missing fields", () => {
    [
      undefined,
      null,
      {},
      { entry: [] },
      { entry: [null, {}, { resource: {} }] },
      "x",
      { entry: [{ resource: { resourceType: "Composition", section: [null, {}] } }] },
    ].forEach((b) => {
      const s = summariseBundle(b);
      expect(s.rows).toEqual([]);
      expect(s.title).toBe("");
    });
  });
});

// Every record our HIP shares carries a PDF copy as a DocumentReference (FhirBundleBuilder); on 29 Oct the Records
// received tab showed it only as base64 inside the raw JSON (HIU_FLOW_110).
const withPdf = {
  resourceType: "Bundle",
  entry: [
    { resource: { resourceType: "Composition", title: "Visit" } },
    {
      resource: {
        resourceType: "DocumentReference",
        content: [{ attachment: { contentType: "application/pdf", title: "Visit note", data: "JVBERi0x" } }],
      },
    },
  ],
};

describe("a record's PDF copy", () => {
  it("lists a record's PDF copy", () => {
    expect(summariseBundle(withPdf).attachments).toEqual([{ title: "Visit note", contentType: "application/pdf", data: "JVBERi0x" }]);
  });

  it("skips an attachment with no data, and never throws", () => {
    const noData = {
      entry: [{ resource: { resourceType: "DocumentReference", content: [{ attachment: { contentType: "application/pdf" } }] } }],
    };
    expect(summariseBundle(noData).attachments).toEqual([]);
    expect(summariseBundle(null).attachments).toEqual([]);
    expect(summariseBundle({ entry: [{ resource: { resourceType: "DocumentReference" } }] }).attachments).toEqual([]);
  });

  it("the raw view never carries the base64", () => {
    const raw = JSON.stringify(withoutAttachmentData(withPdf));
    expect(raw).toContain("<base64, 8 characters>");
    expect(raw).not.toContain("JVBERi0x");
    expect(JSON.stringify(withPdf)).toContain("JVBERi0x");
  });
});
