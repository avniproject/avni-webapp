import { FormTypeEntities } from "./constants";

/**
 * The key FormSettings uses to spot a duplicate form mapping (avniproject/avni-webapp#1805).
 *
 * Extracted from FormSettings#validateForm, which is a closure and so could not be tested in place. The
 * logic here is the part with actual behaviour; the surrounding validation is field-presence checks.
 *
 * The undefined return is what made this worth extracting. FormSettings rejects a mapping whose key it has
 * already seen, so a form type with no branch here produced an undefined key, pushed undefined into the
 * seen list on the first mapping, and had its second mapping falsely rejected as a duplicate - meaning
 * such a type could never have more than one mapping at all.
 */
export function formMappingUniqueKey(formTypeInfo, formMap) {
  if (formTypeInfo === FormTypeEntities.IndividualProfile) {
    return formMap.subjectTypeUuid;
  }
  if (FormTypeEntities.isForProgramEncounter(formTypeInfo)) {
    return formMap.subjectTypeUuid + formMap.programUuid + formMap.encounterTypeUuid;
  }
  if (FormTypeEntities.isForProgramEnrolment(formTypeInfo)) {
    return formMap.subjectTypeUuid + formMap.programUuid;
  }
  if (FormTypeEntities.isForSubjectEncounter(formTypeInfo)) {
    return formMap.subjectTypeUuid + formMap.encounterTypeUuid;
  }
  // Approval and Rejection support all four shapes, so the key is built from whatever is set. The empty
  // string fallbacks keep the shapes distinguishable: without them a subject-only mapping and one with an
  // encounter type would both stringify through undefined and collide.
  if (FormTypeEntities.isApprovalDecisionForm(formTypeInfo)) {
    return formMap.subjectTypeUuid + (formMap.programUuid || "") + (formMap.encounterTypeUuid || "");
  }
  return undefined;
}
