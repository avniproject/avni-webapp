import { WebConcept } from "./WebConcept";

describe("WebConcept.validateNumericRanges", () => {
  function makeConcept(fields: Partial<WebConcept>): WebConcept {
    return {
      name: "Numeric Concept",
      uuid: "uuid",
      dataType: "Numeric",
      keyValues: [],
      answers: [],
      active: true,
      mediaUrl: "",
      lowAbsolute: 0,
      highAbsolute: 100,
      lowNormal: 10,
      highNormal: 90,
      unit: "mg/dL",
      createdBy: "tester",
      lastModifiedBy: "tester",
      creationDateTime: "",
      lastModifiedDateTime: "",
      ...fields
    };
  }

  it("returns no errors for valid ranges", () => {
    const concept = makeConcept({
      lowAbsolute: 0,
      lowNormal: 10,
      highNormal: 90,
      highAbsolute: 100
    });
    const result = WebConcept.validateNumericRanges(concept);
    expect(result).toEqual({});
  });

  it("returns absoluteValidation error when lowAbsolute > highAbsolute", () => {
    const concept = makeConcept({ lowAbsolute: 101, highAbsolute: 100 });
    const result = WebConcept.validateNumericRanges(concept);
    expect(result.absoluteValidation).toBe(true);
  });

  it("returns normalValidation error when lowNormal > highNormal", () => {
    const concept = makeConcept({ lowNormal: 91, highNormal: 90 });
    const result = WebConcept.validateNumericRanges(concept);
    expect(result.normalValidation).toBe(true);
  });

  it("returns absoluteValidation error when normal not within absolute", () => {
    const concept = makeConcept({
      lowAbsolute: 0,
      lowNormal: -1,
      highNormal: 90,
      highAbsolute: 100
    });
    const result = WebConcept.validateNumericRanges(concept);
    expect(result.absoluteValidation).toBe(true);
  });

  it("returns absoluteValidation error when highNormal > highAbsolute", () => {
    const concept = makeConcept({
      lowAbsolute: 0,
      lowNormal: 10,
      highNormal: 101,
      highAbsolute: 100
    });
    const result = WebConcept.validateNumericRanges(concept);
    expect(result.absoluteValidation).toBe(true);
  });

  it("returns all relevant errors when multiple rules are violated", () => {
    const concept = makeConcept({
      lowAbsolute: 101,
      highAbsolute: 100,
      lowNormal: 91,
      highNormal: 90
    });
    const result = WebConcept.validateNumericRanges(concept);
    expect(result.absoluteValidation).toBe(true);
    expect(result.normalValidation).toBe(true);
  });
});
