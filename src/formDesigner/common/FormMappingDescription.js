import { FormTypeEntities } from "./constants";

/**
 * What a decision form's mapping row actually attaches to, said in a sentence.
 *
 * Approval and Rejection are the only form types that attach to all four subject type / programme / visit
 * type shapes, and the screen gives no clue which one a filled-in row means. An administrator choosing a
 * subject type, a programme and a visit type reasonably reads that as covering all three, when it names one
 * thing: that programme's visit. Covering the registration form as well takes a second row, and nothing on
 * screen says so.
 *
 * The wording is lifted from FormMappingService#describeCombination on the server, which is already what an
 * administrator is shown when a mapping is rejected. Inventing a second vocabulary here would mean the
 * error message and the screen naming the same thing differently.
 *
 * The frame differs from the server's, though. describeCombination names the form being judged, because it
 * is explaining what approval must be switched on for. Here the row is the decision form itself, so the
 * sentence says what it will be used to decide on.
 */

const nameFrom = (list, uuid, nameKeys) => {
  if (!uuid) return null;
  const match = (list || []).find((candidate) => candidate.uuid === uuid);
  if (!match) return null;
  return nameKeys.map((key) => match[key]).find(Boolean) || null;
};

/**
 * Null rather than a sentence whenever one cannot be written truthfully: a form type that does not attach
 * to a shape, a row without a subject type yet, or a row naming reference data that has since been voided.
 * That last case already shows "No longer available" in the field itself, and a sentence carrying the
 * placeholder mid-clause reads worse than no sentence.
 */
export function describeDecisionMapping(formTypeInfo, mapping, referenceData = {}) {
  if (!FormTypeEntities.isApprovalDecisionForm(formTypeInfo)) return null;

  const { subjectTypes, programs, encounterTypes } = referenceData;
  const subjectTypeName = nameFrom(subjectTypes, mapping.subjectTypeUuid, ["operationalSubjectTypeName", "name"]);
  if (!subjectTypeName) return null;

  const programName = mapping.programUuid ? nameFrom(programs, mapping.programUuid, ["operationalProgramName", "name"]) : null;
  const encounterTypeName = mapping.encounterTypeUuid ? nameFrom(encounterTypes, mapping.encounterTypeUuid, ["name"]) : null;

  if (mapping.programUuid && !programName) return null;
  if (mapping.encounterTypeUuid && !encounterTypeName) return null;

  const verb = formTypeInfo === FormTypeEntities.Rejection ? "rejecting" : "approving";
  return `Used when ${verb} the ${targetOf(subjectTypeName, programName, encounterTypeName)}.`;
}

function targetOf(subjectTypeName, programName, encounterTypeName) {
  if (encounterTypeName) {
    return programName
      ? `${encounterTypeName} visit or visit cancellation form for ${subjectTypeName} in ${programName}`
      : `${encounterTypeName} visit or visit cancellation form for ${subjectTypeName}`;
  }
  if (programName) {
    return `${programName} enrolment or exit form for ${subjectTypeName}`;
  }
  return `${subjectTypeName} registration form`;
}
