import { assert } from "chai";
import { FormTypeEntities } from "./constants";
import {
  NO_LONGER_AVAILABLE,
  encounterTypeLabel,
  encounterTypeOptions,
  generalEncounterTypesForSubjectType,
  programEncounterTypesForProgram,
  programLabel,
  programOptions,
  programsForSubjectType,
  withoutCombinationsAlreadyUsed,
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

  /**
   * Dropping choices that would duplicate another row on the same form.
   *
   * Note the shape: formMappingUniqueKey reads a FormSettings row - subjectTypeUuid, programUuid,
   * encounterTypeUuid - not the contract shape the organisation-wide mappings above use. The two sit next
   * to each other in this file and mixing them silently matches nothing.
   */
  describe("combinations already used on this form", () => {
    const row = (subjectTypeUuid, programUuid, encounterTypeUuid) => ({
      subjectTypeUuid,
      programUuid,
      encounterTypeUuid,
    });

    it("drops a programme already paired with this subject type on another row", () => {
      const rows = [row(STUDENT, ANGANWADI, null), row(STUDENT, "", null)];

      const options = withoutCombinationsAlreadyUsed(programs, "programUuid", rows, 1, FormTypeEntities.ProgramEnrolment);

      assert.deepEqual(
        ["p-karigar"],
        options.map((p) => p.uuid),
        "Anganwadi is taken by the first row",
      );
    });

    /** Excluding a row's own value would blank the field the moment another row matched. */
    it("keeps the value this row already holds", () => {
      const rows = [row(STUDENT, ANGANWADI, null), row(STUDENT, ANGANWADI, null)];

      const options = withoutCombinationsAlreadyUsed(programs, "programUuid", rows, 1, FormTypeEntities.ProgramEnrolment);

      assert.include(
        options.map((p) => p.uuid),
        ANGANWADI,
        "a row must never hide what it is already set to",
      );
    });

    it("gives a combination back when the row holding it is voided", () => {
      const taken = { ...row(STUDENT, ANGANWADI, null), voided: true };
      const rows = [taken, row(STUDENT, "", null)];

      const options = withoutCombinationsAlreadyUsed(programs, "programUuid", rows, 1, FormTypeEntities.ProgramEnrolment);

      assert.include(
        options.map((p) => p.uuid),
        ANGANWADI,
      );
    });

    it("drops a subject type already used on a registration form, where the subject type is the whole key", () => {
      const subjectTypes = [{ uuid: STUDENT }, { uuid: AWC_CENTER }];
      const rows = [row(STUDENT, null, null), row("", null, null)];

      const options = withoutCombinationsAlreadyUsed(subjectTypes, "subjectTypeUuid", rows, 1, FormTypeEntities.IndividualProfile);

      assert.deepEqual(
        [AWC_CENTER],
        options.map((s) => s.uuid),
      );
    });

    /** A decision form's four shapes are different combinations, so one does not block another. */
    it("does not let a subject-only decision row block a programme one", () => {
      const rows = [row(STUDENT, null, null), row(STUDENT, "", null)];

      const options = withoutCombinationsAlreadyUsed(programs, "programUuid", rows, 1, FormTypeEntities.Approval);

      assert.equal(2, options.length, "neither programme completes the subject-only combination");
    });

    it("leaves the list alone when the row does not exist", () => {
      assert.deepEqual(programs, withoutCombinationsAlreadyUsed(programs, "programUuid", [], 0, FormTypeEntities.Approval));
    });

    /**
     * The callers map straight over the result, and the reference lists are undefined until
     * operationalModules has loaded - so returning anything but an array puts a crash one render away.
     */
    it("always hands back an array, even before the lists have loaded", () => {
      assert.deepEqual([], withoutCombinationsAlreadyUsed(undefined, "programUuid", [], 0, FormTypeEntities.Approval));
      assert.deepEqual(
        [],
        withoutCombinationsAlreadyUsed(undefined, "subjectTypeUuid", [{ subjectTypeUuid: STUDENT }], 0, FormTypeEntities.IndividualProfile),
      );
    });
  });

  /**
   * A form type that defines a relationship must not be narrowed by it.
   *
   * Narrowing every form type alike made the first mapping of each defining type impossible to create: the
   * ProgramEnrolment form is what makes a programme belong to a subject type, so deriving its options from
   * existing ProgramEnrolment mappings left 4938 subject type and programme pairs across 315 organisations
   * with nothing to pick. These are the cases that were missing when that shipped.
   */
  describe("form types that define a relationship", () => {
    it("offers every programme on the form that decides which programmes a subject type enrols in", () => {
      const options = programOptions(programs, formMappings, AWC_CENTER, FormTypeEntities.ProgramEnrolment);

      assert.deepEqual(
        [ANGANWADI, "p-karigar"],
        options.map((p) => p.uuid),
        "an unmapped programme must still be selectable",
      );
    });

    it("offers every visit type on the form that decides a subject's own visits", () => {
      const options = encounterTypeOptions(encounterTypes, formMappings, STUDENT, undefined, FormTypeEntities.Encounter);

      assert.equal(3, options.length);
    });

    it("offers every visit type on the form that decides a programme's visits", () => {
      const options = encounterTypeOptions(encounterTypes, formMappings, AWC_CENTER, ANGANWADI, FormTypeEntities.ProgramEncounter);

      assert.equal(3, options.length);
    });

    it("still offers nothing until a subject type is chosen", () => {
      assert.deepEqual([], programOptions(programs, formMappings, "", FormTypeEntities.ProgramEnrolment));
      assert.deepEqual([], encounterTypeOptions(encounterTypes, formMappings, "", undefined, FormTypeEntities.Encounter));
    });

    it("keeps narrowing the form types that only consume the relationship", () => {
      assert.deepEqual([], programOptions(programs, formMappings, AWC_CENTER, FormTypeEntities.ProgramExit));
      assert.deepEqual(
        [ANGANWADI],
        programOptions(programs, formMappings, STUDENT, FormTypeEntities.Approval).map((p) => p.uuid),
      );
      assert.deepEqual(
        ["et-visit"],
        encounterTypeOptions(encounterTypes, formMappings, STUDENT, ANGANWADI, FormTypeEntities.ProgramEncounterCancellation).map(
          (e) => e.uuid,
        ),
      );
    });
  });
});
