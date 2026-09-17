import { assert } from "chai";
import { FormTypeEntities } from "./constants";
import { formMappingUniqueKey } from "./FormMappingKey";

/**
 * avniproject/avni-webapp#1805 - the duplicate-detection key for a form mapping.
 *
 * This is where the story's central defect lives. FormSettings builds a key per mapping and rejects a
 * mapping whose key it has already seen. With no branch matching the form type the key stays undefined,
 * the first mapping pushes undefined into the seen list, and the second is then falsely rejected as a
 * duplicate - so an Approval or Rejection form could never have more than one mapping.
 *
 * Approval and Rejection are the first types supporting all four shapes, so the key is built from whatever
 * is set rather than from a fixed combination.
 */
describe("formMappingUniqueKey", () => {
  const subjectOnly = { subjectTypeUuid: "st-1" };
  const withEncounter = { subjectTypeUuid: "st-1", encounterTypeUuid: "et-1" };
  const withProgramme = { subjectTypeUuid: "st-1", programUuid: "p-1" };
  const withBoth = { subjectTypeUuid: "st-1", programUuid: "p-1", encounterTypeUuid: "et-1" };

  [FormTypeEntities.Approval, FormTypeEntities.Rejection].forEach((formTypeInfo) => {
    describe(formTypeInfo.formType, () => {
      /**
       * AC #6, and the reason this helper exists. Two mappings of the same form in different shapes must
       * both save.
       */
      it("gives a subject-only and an encounter mapping different keys, so both save", () => {
        const subjectKey = formMappingUniqueKey(formTypeInfo, subjectOnly);
        const encounterKey = formMappingUniqueKey(formTypeInfo, withEncounter);

        assert.notEqual(subjectKey, encounterKey, "the second mapping must not look like a duplicate of the first");
        assert.isDefined(subjectKey);
        assert.isDefined(encounterKey);
      });

      it("gives all four shapes distinct keys", () => {
        const keys = [subjectOnly, withEncounter, withProgramme, withBoth].map((m) => formMappingUniqueKey(formTypeInfo, m));

        assert.equal(4, new Set(keys).size, `all four shapes should be distinguishable, got ${JSON.stringify(keys)}`);
      });

      it("still detects a genuine duplicate", () => {
        assert.equal(formMappingUniqueKey(formTypeInfo, withBoth), formMappingUniqueKey(formTypeInfo, { ...withBoth }));
      });

      it("never returns undefined, which is what caused the false duplicate", () => {
        assert.isDefined(formMappingUniqueKey(formTypeInfo, subjectOnly));
      });
    });
  });

  // The existing types must keep the keys they have today

  it("keys a subject registration on the subject type alone", () => {
    assert.equal("st-1", formMappingUniqueKey(FormTypeEntities.IndividualProfile, withBoth));
  });

  it("keys a programme encounter on all three", () => {
    assert.equal("st-1p-1et-1", formMappingUniqueKey(FormTypeEntities.ProgramEncounter, withBoth));
  });

  it("keys a programme enrolment on subject type and programme", () => {
    assert.equal("st-1p-1", formMappingUniqueKey(FormTypeEntities.ProgramEnrolment, withBoth));
  });

  it("keys a subject encounter on subject type and encounter type", () => {
    assert.equal("st-1et-1", formMappingUniqueKey(FormTypeEntities.Encounter, withBoth));
  });
});
