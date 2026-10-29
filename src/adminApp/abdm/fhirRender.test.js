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

  it("offers only a PDF, never another kind of attachment", () => {
    const of = (contentType) => ({
      entry: [{ resource: { resourceType: "DocumentReference", content: [{ attachment: { contentType, data: "PGh0bWw+" } }] } }],
    });
    expect(summariseBundle(of("text/html")).attachments).toEqual([]);
    expect(summariseBundle(of("image/svg+xml")).attachments).toEqual([]);
    expect(summariseBundle(of(undefined)).attachments).toEqual([]);
    expect(summariseBundle(of("application/pdf; charset=binary")).attachments.length).toBe(1);
  });

  it("offers a PDF from a lab report or a Binary as well", () => {
    const b = {
      entry: [
        {
          resource: {
            resourceType: "DiagnosticReport",
            presentedForm: [{ contentType: "application/pdf", title: "Lab report", data: "JVBERi0y" }],
          },
        },
        { resource: { resourceType: "Binary", contentType: "application/pdf", data: "JVBERi0z" } },
      ],
    };
    expect(summariseBundle(b).attachments).toEqual([
      { title: "Lab report", contentType: "application/pdf", data: "JVBERi0y" },
      { title: "", contentType: "application/pdf", data: "JVBERi0z" },
    ]);
  });

  it("the raw view never carries base64 wherever the record keeps it", () => {
    const b = {
      entry: [
        { resource: { resourceType: "DiagnosticReport", presentedForm: [{ contentType: "application/pdf", data: "JVBERi0y" }] } },
        { resource: { resourceType: "Binary", contentType: "image/png", data: "iVBORw0K" } },
      ],
    };
    const raw = JSON.stringify(withoutAttachmentData(b));
    expect(raw).not.toContain("JVBERi0y");
    expect(raw).not.toContain("iVBORw0K");
  });

  it("the raw view never carries the base64", () => {
    const raw = JSON.stringify(withoutAttachmentData(withPdf));
    expect(raw).toContain("<base64, 8 characters>");
    expect(raw).not.toContain("JVBERi0x");
    expect(JSON.stringify(withPdf)).toContain("JVBERi0x");
  });
});
