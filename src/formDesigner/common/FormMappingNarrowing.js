import { FormTypeEntities } from "./constants";
import { formMappingUniqueKey } from "./FormMappingKey";

/**
 * Which programmes and visit types a form mapping may point at, given the subject type it is for.
 *
 * FormSettings offered every programme and every visit type in the organisation regardless of the subject
 * type on the row, so nothing stopped an administrator pairing a subject type with a programme that has
 * nothing to do with it. Production carries 81 such mappings across 39 organisations - one of them a
 * cancellation form on a subject type that enrols in no programme at all, pointed at a programme only a
 * different subject type enters.
 *
 * The rule mirrors the server's own /web/program/v2 and /web/encounterType/v2: a programme belongs to a
 * subject type when a ProgramEnrolment form maps the two together, a general visit type when an Encounter
 * form does, and a programme visit type when a ProgramEncounter form does. Deriving it here rather than
 * calling those endpoints avoids a request per mapping row, since /web/operationalModules already sends the
 * organisation's whole mapping list.
 *
 * The organisation-wide mappings are never filtered on voided. They arrive from
 * FormMappingRepository#findAllOperational, which is already "isVoided = false", and the contract marks
 * the field NON_DEFAULT so an unvoided mapping carries no voided key at all - a defensive check against it
 * would match nothing rather than nothing extra.
 *
 * withoutCombinationsAlreadyUsed below is the exception, and reads a different list: the rows of the form
 * being edited, which do carry the flag and where a removed row must give its combination back.
 */

/** Shown in place of a name when a mapping points at reference data that has since been voided. */
export const NO_LONGER_AVAILABLE = "No longer available";

const mappingsOfType = (formMappings, formTypeInfo) => (formMappings || []).filter((mapping) => mapping.formType === formTypeInfo.formType);

const uuidsFrom = (mappings, key) => new Set(mappings.map((mapping) => mapping[key]).filter(Boolean));

/**
 * Empty until a subject type is chosen. The dropdowns used to be populated before the row had a subject
 * type, which is what made an unrelated pairing the path of least resistance.
 */
export function programsForSubjectType(programs, formMappings, subjectTypeUuid) {
  if (!subjectTypeUuid) return [];
  const enrolments = mappingsOfType(formMappings, FormTypeEntities.ProgramEnrolment).filter(
    (mapping) => mapping.subjectTypeUUID === subjectTypeUuid,
  );
  const allowed = uuidsFrom(enrolments, "programUUID");
  return (programs || []).filter((program) => allowed.has(program.uuid));
}

/** Visit types recorded against the subject directly - the shape with no programme. */
export function generalEncounterTypesForSubjectType(encounterTypes, formMappings, subjectTypeUuid) {
  if (!subjectTypeUuid) return [];
  const general = mappingsOfType(formMappings, FormTypeEntities.Encounter).filter(
    (mapping) => mapping.subjectTypeUUID === subjectTypeUuid && !mapping.programUUID,
  );
  const allowed = uuidsFrom(general, "encounterTypeUUID");
  return (encounterTypes || []).filter((encounterType) => allowed.has(encounterType.uuid));
}

/** Visit types recorded inside a programme, which is a different set from the general ones. */
export function programEncounterTypesForProgram(encounterTypes, formMappings, subjectTypeUuid, programUuid) {
  if (!subjectTypeUuid || !programUuid) return [];
  const programEncounters = mappingsOfType(formMappings, FormTypeEntities.ProgramEncounter).filter(
    (mapping) => mapping.subjectTypeUUID === subjectTypeUuid && mapping.programUUID === programUuid,
  );
  const allowed = uuidsFrom(programEncounters, "encounterTypeUUID");
  return (encounterTypes || []).filter((encounterType) => allowed.has(encounterType.uuid));
}

/**
 * A form type that DEFINES a relationship cannot have its own list narrowed by that relationship.
 *
 * The ProgramEnrolment form is what makes a programme belong to a subject type. Deriving its Program list
 * from existing ProgramEnrolment mappings means the first one can never be created and no new programme can
 * ever be added to a subject type - 4938 subject type and programme pairs across 315 organisations become
 * unreachable. The same circularity applies to the Encounter form, which defines a subject's own visit
 * types, and to the ProgramEncounter form, which defines a programme's.
 *
 * Only form types that CONSUME a relationship are narrowed by it. A programme encounter cancellation is
 * narrowed by ProgramEncounter mappings, a programme exit by ProgramEnrolment ones, and a decision form by
 * all of them - none of which it defines.
 */
const definesProgrammesForSubjectType = (formTypeInfo) => formTypeInfo === FormTypeEntities.ProgramEnrolment;

const definesEncounterTypes = (formTypeInfo) =>
  formTypeInfo === FormTypeEntities.Encounter || formTypeInfo === FormTypeEntities.ProgramEncounter;

/**
 * What the Program dropdown holds. Empty until a subject type is chosen whatever the form type, because
 * that part is what stops an unrelated pairing being the path of least resistance.
 */
export function programOptions(programs, formMappings, subjectTypeUuid, formTypeInfo) {
  if (!subjectTypeUuid) return [];
  if (definesProgrammesForSubjectType(formTypeInfo)) return programs || [];
  return programsForSubjectType(programs, formMappings, subjectTypeUuid);
}

/**
 * What the Encounter Type dropdown holds. For a form type that consumes visit types, choosing a programme
 * switches the row from the subject's own to that programme's, because the two are different sets and
 * offering both is what let a programme's visit type be attached to a mapping outside that programme.
 */
export function encounterTypeOptions(encounterTypes, formMappings, subjectTypeUuid, programUuid, formTypeInfo) {
  if (!subjectTypeUuid) return [];
  if (definesEncounterTypes(formTypeInfo)) return encounterTypes || [];
  return programUuid
    ? programEncounterTypesForProgram(encounterTypes, formMappings, subjectTypeUuid, programUuid)
    : generalEncounterTypesForSubjectType(encounterTypes, formMappings, subjectTypeUuid);
}

/**
 * Drops the choices that would make this row a duplicate of another row on the same form.
 *
 * Two rules, because Approval and Rejection are the only form types whose shapes nest. For every other
 * type a combination is either taken or it is not, and the key decides it. For a decision form, a mapping
 * at (Mother) does not mean Mother is spent - (Mother, Pregnancy) and (Mother, Pregnancy, ANC) are still
 * buildable, and hiding Mother from the Subject Type list forecloses both. So an option is hidden only
 * once its whole branch is exhausted: the subject type when every programme under it and every general
 * visit type is taken, a programme when every visit type under it is taken, a visit type when that exact
 * triple is taken.
 *
 * referenceData carries what is buildable - the organisation's mappings and its programme and visit type
 * lists - and is only consulted for decision forms. Without it a decision form falls back to treating a
 * subject-only sibling as exhausting the subject type, which is the behaviour this rule exists to correct.
 *
 * Saving two identical mappings is already refused - "Same mapping already exists" - but only after the
 * administrator has filled the row in and pressed Save. Removing the choice up front means the combination
 * cannot be built at all.
 *
 * It reuses formMappingUniqueKey rather than deciding for itself what counts as the same mapping. Two
 * definitions of "duplicate" would drift, and the key already knows that a registration form is keyed on
 * the subject type alone, an enrolment on subject type and programme, and a decision form on whatever is
 * filled in.
 *
 * A row never hides its own current value. Excluding it would blank the field the moment another row
 * happened to match, which is the same disappearing-value problem renderValue exists to prevent.
 *
 * Voided rows are ignored: a mapping the administrator has removed must give its combination back.
 */
/**
 * A row only claims a combination once it holds every field its form type needs.
 *
 * formMappingUniqueKey concatenates whatever is filled in, with no separator, so a half-filled row
 * produces the same key as the empty row being edited: on an Encounter form, row 0 at (AWC Center, "")
 * keys as "st-awc", and so does a fresh row 1 - which removed AWC Center from row 1's dropdown until row
 * 0 had a visit type. validateForm refuses incomplete rows at save, so the collision was unreachable
 * until this check moved into the dropdown.
 *
 * The requirements mirror validateForm's. A registration form needs only the subject type, and a decision
 * form is legitimate in all four shapes - so two subject-only decision rows genuinely are duplicates and
 * must still collide.
 */
const isFullySpecified = (formTypeInfo, row) => {
  if (!row.subjectTypeUuid) return false;
  if (FormTypeEntities.isForProgramEncounter(formTypeInfo)) return !!row.programUuid && !!row.encounterTypeUuid;
  if (FormTypeEntities.isForProgramEnrolment(formTypeInfo)) return !!row.programUuid;
  if (FormTypeEntities.isForSubjectEncounter(formTypeInfo)) return !!row.encounterTypeUuid;
  return true;
};

const sameValue = (a, b) => (a || null) === (b || null);

const hasSiblingAt = (siblings, subjectTypeUuid, programUuid, encounterTypeUuid) =>
  siblings.some(
    (sibling) =>
      sameValue(sibling.subjectTypeUuid, subjectTypeUuid) &&
      sameValue(sibling.programUuid, programUuid) &&
      sameValue(sibling.encounterTypeUuid, encounterTypeUuid),
  );

/** Taken at the programme itself, and at every visit type that could sit under it. */
const programmeIsExhausted = (siblings, subjectTypeUuid, programUuid, referenceData) =>
  hasSiblingAt(siblings, subjectTypeUuid, programUuid, null) &&
  programEncounterTypesForProgram(referenceData.encounterTypes, referenceData.orgMappings, subjectTypeUuid, programUuid).every(
    (encounterType) => hasSiblingAt(siblings, subjectTypeUuid, programUuid, encounterType.uuid),
  );

/** Taken at the subject type itself, at every programme under it, and at every general visit type. */
const subjectTypeIsExhausted = (siblings, subjectTypeUuid, referenceData) =>
  hasSiblingAt(siblings, subjectTypeUuid, null, null) &&
  programsForSubjectType(referenceData.programs, referenceData.orgMappings, subjectTypeUuid).every((programme) =>
    programmeIsExhausted(siblings, subjectTypeUuid, programme.uuid, referenceData),
  ) &&
  generalEncounterTypesForSubjectType(referenceData.encounterTypes, referenceData.orgMappings, subjectTypeUuid).every((encounterType) =>
    hasSiblingAt(siblings, subjectTypeUuid, null, encounterType.uuid),
  );

const branchIsExhausted = (field, optionUuid, row, siblings, referenceData) => {
  if (field === "subjectTypeUuid") return subjectTypeIsExhausted(siblings, optionUuid, referenceData);
  if (field === "programUuid") return programmeIsExhausted(siblings, row.subjectTypeUuid, optionUuid, referenceData);
  return hasSiblingAt(siblings, row.subjectTypeUuid, row.programUuid, optionUuid);
};

export function withoutCombinationsAlreadyUsed(options, field, formMappings, index, formTypeInfo, referenceData = {}) {
  const rows = formMappings || [];
  const row = rows[index];
  // No row means nothing to compare against, so the list passes through untouched - coerced, because the
  // callers map straight over the result and the reference lists are undefined until operationalModules
  // has loaded.
  if (!row) return options || [];

  const siblings = rows.filter((other, otherIndex) => otherIndex !== index && !other.voided);
  const holdsItAlready = (option) => row[field] === option.uuid;

  // A decision form's four shapes nest, so "already used" cannot be decided from the key alone: a row on
  // its way to a deeper shape passes through the key of a shallower one. Hide an option only once nothing
  // further can be built under it.
  if (FormTypeEntities.isApprovalDecisionForm(formTypeInfo)) {
    return (options || []).filter(
      (option) => holdsItAlready(option) || !branchIsExhausted(field, option.uuid, row, siblings, referenceData),
    );
  }

  const takenKeys = new Set(
    siblings
      .filter((other) => isFullySpecified(formTypeInfo, other))
      .map((other) => formMappingUniqueKey(formTypeInfo, other))
      .filter(Boolean),
  );

  return (options || []).filter((option) => {
    if (holdsItAlready(option)) return true;
    const key = formMappingUniqueKey(formTypeInfo, { ...row, [field]: option.uuid });
    return !key || !takenKeys.has(key);
  });
}

/**
 * The label for a saved value, resolved against the organisation's full list rather than the narrowed one.
 *
 * FormSettings renders the Program and Encounter Type values through Select#renderValue instead of relying
 * on a matching MenuItem, so a mapping already holding a value the narrowed list no longer offers keeps
 * showing it and is sent back unchanged on save. Blanking those rows would rewrite live configuration in 39
 * organisations the moment somebody opened the screen for an unrelated reason.
 *
 * The Subject Type dropdown has no such treatment, so a mapping whose subject type has been voided renders
 * an empty box beside a Program field reading "No longer available". The value is still saved unchanged -
 * this is what is displayed, not what is kept.
 *
 * Reference data that has itself been voided is absent from both lists - findAllOperational excludes it -
 * so those fall back to a placeholder. They render as an empty box today, which says less.
 */
export function programLabel(programs, uuid) {
  if (!uuid) return "";
  const program = (programs || []).find((candidate) => candidate.uuid === uuid);
  return program ? program.operationalProgramName || program.name : NO_LONGER_AVAILABLE;
}

export function encounterTypeLabel(encounterTypes, uuid) {
  if (!uuid) return "";
  const encounterType = (encounterTypes || []).find((candidate) => candidate.uuid === uuid);
  return encounterType ? encounterType.name : NO_LONGER_AVAILABLE;
}
