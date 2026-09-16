import { FormTypeEntities } from "./constants";

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
 * Nothing filters on voided. The list arrives from FormMappingRepository#findAllOperational, which is
 * already "isVoided = false", and the contract marks the field NON_DEFAULT so an unvoided mapping carries
 * no voided key at all - a defensive check against it would match nothing rather than nothing extra.
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
 * What the Encounter Type dropdown holds. Choosing a programme switches the row from the subject's own
 * visit types to that programme's, because the two are different sets and offering both is what let a
 * programme's visit type be attached to a mapping outside that programme.
 */
export function encounterTypeOptions(encounterTypes, formMappings, subjectTypeUuid, programUuid) {
  return programUuid
    ? programEncounterTypesForProgram(encounterTypes, formMappings, subjectTypeUuid, programUuid)
    : generalEncounterTypesForSubjectType(encounterTypes, formMappings, subjectTypeUuid);
}

/**
 * The label for a saved value, resolved against the organisation's full list rather than the narrowed one.
 *
 * FormSettings renders the selected value through Select#renderValue instead of relying on a matching
 * MenuItem, so a mapping already holding a value the narrowed list no longer offers keeps showing it and is
 * sent back unchanged on save. Blanking those rows would rewrite live configuration in 39 organisations
 * the moment somebody opened the screen for an unrelated reason.
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
