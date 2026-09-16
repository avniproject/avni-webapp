import { assert } from "chai";
import {
  NO_LONGER_AVAILABLE,
  encounterTypeLabel,
  encounterTypeOptions,
  generalEncounterTypesForSubjectType,
  programEncounterTypesForProgram,
  programLabel,
  programsForSubjectType,
} from "./FormMappingNarrowing";

/**
 * Narrowing the form mapping dropdowns to what the chosen subject type actually has.
 *
 * The case driving this is real and in production: an organisation has a cancellation form on subject type
 * "AWC Center" pointed at programme "Anganwadi", which only "Student" ever enrols in - and AWC Center
 * enrols in no programme at all. An unfiltered dropdown is what made that reachable, and 81 mappings across
 * 39 organisations are in the same state.
 *
 * The second thing these pin is that nothing filters on a voided flag. The mappings arrive already
 * unvoided and carry no voided key, so a helper checking one would match nothing at all.
 */
describe("FormMappingNarrowing", () => {
  const AWC_CENTER = "st-awc-center";
  const STUDENT = "st-student";
  const ANGANWADI = "p-anganwadi";

  const programs = [
    { uuid: ANGANWADI, operationalProgramName: "Anganwadi" },
    { uuid: "p-karigar", operationalProgramName: "Karigar" },
  ];
  const encounterTypes = [
    { uuid: "et-in-out", name: "AWC Child - In Time out Time" },
    { uuid: "et-visit", name: "Monthly Visit" },
    { uuid: "et-annual", name: "Annual Visit" },
  ];

  const formMappings = [
    // Anganwadi enrols Student, and only Student.
    { formType: "ProgramEnrolment", subjectTypeUUID: STUDENT, programUUID: ANGANWADI },
    // AWC Center has a general encounter of its own, with no programme.
    { formType: "Encounter", subjectTypeUUID: AWC_CENTER, encounterTypeUUID: "et-in-out" },
    // Student's programme encounters sit inside Anganwadi.
    { formType: "ProgramEncounter", subjectTypeUUID: STUDENT, programUUID: ANGANWADI, encounterTypeUUID: "et-visit" },
  ];

  describe("programsForSubjectType", () => {
    it("offers nothing until a subject type is chosen", () => {
      assert.deepEqual([], programsForSubjectType(programs, formMappings, undefined));
      assert.deepEqual([], programsForSubjectType(programs, formMappings, ""));
    });

    it("offers a programme only to the subject type that enrols in it", () => {
      assert.deepEqual(
        [ANGANWADI],
        programsForSubjectType(programs, formMappings, STUDENT).map((p) => p.uuid),
      );
    });

    /** The production defect. AWC Center enrols in nothing, so the row could never have been created. */
    it("offers nothing to a subject type that enrols in no programme", () => {
      assert.deepEqual([], programsForSubjectType(programs, formMappings, AWC_CENTER));
    });

    it("ignores a programme referenced only by a non-enrolment form", () => {
      const encounterOnly = [
        { formType: "ProgramEncounter", subjectTypeUUID: AWC_CENTER, programUUID: ANGANWADI, encounterTypeUUID: "et-visit" },
      ];

      assert.deepEqual(
        [],
        programsForSubjectType(programs, encounterOnly, AWC_CENTER),
        "a programme encounter does not make the subject type enrol",
      );
    });
  });

  describe("encounter types", () => {
    it("offers nothing until a subject type is chosen", () => {
      assert.deepEqual([], generalEncounterTypesForSubjectType(encounterTypes, formMappings, undefined));
    });

    it("offers the subject's own visit types when no programme is chosen", () => {
      assert.deepEqual(
        ["et-in-out"],
        generalEncounterTypesForSubjectType(encounterTypes, formMappings, AWC_CENTER).map((e) => e.uuid),
      );
    });

    it("offers the programme's visit types once a programme is chosen", () => {
      assert.deepEqual(
        ["et-visit"],
        programEncounterTypesForProgram(encounterTypes, formMappings, STUDENT, ANGANWADI).map((e) => e.uuid),
      );
    });

    it("keeps general and programme visit types apart", () => {
      const general = encounterTypeOptions(encounterTypes, formMappings, AWC_CENTER, undefined).map((e) => e.uuid);
      const inProgramme = encounterTypeOptions(encounterTypes, formMappings, STUDENT, ANGANWADI).map((e) => e.uuid);

      assert.deepEqual(["et-in-out"], general);
      assert.deepEqual(["et-visit"], inProgramme);
    });

    it("offers nothing for a programme the subject type has no encounters in", () => {
      assert.deepEqual([], programEncounterTypesForProgram(encounterTypes, formMappings, AWC_CENTER, ANGANWADI));
    });
  });

  /**
   * The mappings come from findAllOperational, which has already excluded voided rows, and the contract
   * omits the flag when false. A helper filtering on it would drop every mapping it was handed.
   */
  it("counts a mapping that carries no voided flag", () => {
    assert.deepEqual(
      [ANGANWADI],
      programsForSubjectType(programs, [{ formType: "ProgramEnrolment", subjectTypeUUID: STUDENT, programUUID: ANGANWADI }], STUDENT).map(
        (p) => p.uuid,
      ),
    );
  });

  describe("labels for values the narrowed list no longer offers", () => {
    it("names a value that is still live, so the row reads as saved", () => {
      assert.equal("Anganwadi", programLabel(programs, ANGANWADI));
      assert.equal("Annual Visit", encounterTypeLabel(encounterTypes, "et-annual"));
    });

    it("falls back to a placeholder when the reference data itself was voided", () => {
      assert.equal(NO_LONGER_AVAILABLE, programLabel(programs, "p-deleted"));
      assert.equal(NO_LONGER_AVAILABLE, encounterTypeLabel(encounterTypes, "et-deleted"));
    });

    it("shows nothing for an empty value rather than the placeholder", () => {
      assert.equal("", programLabel(programs, ""));
      assert.equal("", encounterTypeLabel(encounterTypes, undefined));
    });
  });
});
