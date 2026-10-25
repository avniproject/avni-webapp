// DEMO-ONLY abdm-hackathon
import { summariseBundle } from "./fhirRender";
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
