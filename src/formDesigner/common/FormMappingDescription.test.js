import { assert } from "chai";
import { FormTypeEntities } from "./constants";
import { describeDecisionMapping } from "./FormMappingDescription";

/**
 * The sentence under a decision form's mapping row.
 *
 * It exists because choosing a subject type, a programme and a visit type reads as covering all three, and
 * names one thing. These cases pin that each of the four shapes says something different, so the row cannot
 * silently mean the wrong one.
 */
describe("describeDecisionMapping", () => {
  const referenceData = {
    subjectTypes: [{ uuid: "st-1", operationalSubjectTypeName: "Test person" }],
    programs: [{ uuid: "p-1", operationalProgramName: "Pregancy" }],
    encounterTypes: [{ uuid: "et-1", name: "Risk encounter" }],
  };

  const shape = (extra) => ({ subjectTypeUuid: "st-1", ...extra });

  it("names the registration form when only a subject type is set", () => {
    assert.equal(
      "Used when approving the Test person registration form.",
      describeDecisionMapping(FormTypeEntities.Approval, shape({}), referenceData),
    );
  });

  it("names the enrolment or exit form when a programme is set", () => {
    assert.equal(
      "Used when approving the Pregancy enrolment or exit form for Test person.",
      describeDecisionMapping(FormTypeEntities.Approval, shape({ programUuid: "p-1" }), referenceData),
    );
  });

  it("names the subject's own visit when a visit type is set without a programme", () => {
    assert.equal(
      "Used when approving the Risk encounter visit or visit cancellation form for Test person.",
      describeDecisionMapping(FormTypeEntities.Approval, shape({ encounterTypeUuid: "et-1" }), referenceData),
    );
  });

  /** The case that prompted this: all three set means one thing, not three. */
  it("names a single programme visit when all three are set", () => {
    assert.equal(
      "Used when approving the Risk encounter visit or visit cancellation form for Test person in Pregancy.",
      describeDecisionMapping(FormTypeEntities.Approval, shape({ programUuid: "p-1", encounterTypeUuid: "et-1" }), referenceData),
    );
  });

  it("gives all four shapes a different sentence", () => {
    const sentences = [
      shape({}),
      shape({ programUuid: "p-1" }),
      shape({ encounterTypeUuid: "et-1" }),
      shape({ programUuid: "p-1", encounterTypeUuid: "et-1" }),
    ].map((mapping) => describeDecisionMapping(FormTypeEntities.Approval, mapping, referenceData));

    assert.equal(4, new Set(sentences).size, `each shape should read differently, got ${JSON.stringify(sentences)}`);
  });

  it("says rejecting on a Rejection form", () => {
    assert.equal(
      "Used when rejecting the Test person registration form.",
      describeDecisionMapping(FormTypeEntities.Rejection, shape({}), referenceData),
    );
  });

  // Where no sentence can be written truthfully

  it("says nothing for a form type that does not attach to a shape", () => {
    assert.isNull(
      describeDecisionMapping(FormTypeEntities.ProgramEncounter, shape({ programUuid: "p-1", encounterTypeUuid: "et-1" }), referenceData),
    );
    assert.isNull(describeDecisionMapping(FormTypeEntities.IndividualProfile, shape({}), referenceData));
  });

  it("says nothing before a subject type is chosen", () => {
    assert.isNull(describeDecisionMapping(FormTypeEntities.Approval, { subjectTypeUuid: "" }, referenceData));
  });

  /**
   * The field already reads "No longer available" in this case. A sentence carrying that mid-clause reads
   * worse than no sentence.
   */
  it("says nothing when the row names reference data that has been voided", () => {
    assert.isNull(describeDecisionMapping(FormTypeEntities.Approval, shape({ programUuid: "p-gone" }), referenceData));
    assert.isNull(describeDecisionMapping(FormTypeEntities.Approval, shape({ encounterTypeUuid: "et-gone" }), referenceData));
  });

  it("survives reference data not having loaded yet", () => {
    assert.isNull(describeDecisionMapping(FormTypeEntities.Approval, shape({}), {}));
  });
});
