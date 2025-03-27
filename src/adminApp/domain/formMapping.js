import { find, get } from "lodash";
import { Form, Privilege } from "openchs-models";

//todo: this should be loaded from the server
const privilegeTypes = new Map([
  [Form.formTypes.ChecklistItem, Privilege.PrivilegeType.EditChecklistConfiguration],
  [Form.formTypes.Encounter, Privilege.PrivilegeType.EditEncounterType],
  [Form.formTypes.IndividualEncounterCancellation, Privilege.PrivilegeType.EditEncounterType],
  [Form.formTypes.IndividualProfile, Privilege.PrivilegeType.EditSubjectType],
  [Form.formTypes.ManualProgramEnrolmentEligibility, Privilege.PrivilegeType.EditProgram],
  [Form.formTypes.ProgramEncounter, Privilege.PrivilegeType.EditEncounterType],
  [Form.formTypes.ProgramEncounterCancellation, Privilege.PrivilegeType.EditEncounterType],
  [Form.formTypes.ProgramEnrolment, Privilege.PrivilegeType.EditProgram],
  [Form.formTypes.ProgramExit, Privilege.PrivilegeType.EditProgram],
  [Form.formTypes.SubjectEnrolmentEligibility, Privilege.PrivilegeType.EditSubjectType],
  [Form.formTypes.Task, Privilege.PrivilegeType.EditTaskType]
]);

export function getPrivilegeType(formType) {
  return privilegeTypes.get(formType);
}

export const findProgramEncounterForm = (formMappings, encounterType) =>
  formMappings.find(
    mapping =>
      (mapping.formType === "ProgramEncounter" || mapping.formType === "Encounter") &&
      mapping.isVoided === false &&
      mapping.encounterTypeUUID === encounterType.uuid
  );

export const findProgramEncounterCancellationForm = (formMappings, encounterType) =>
  formMappings.find(
    mapping =>
      (mapping.formType === "ProgramEncounterCancellation" || mapping.formType === "IndividualEncounterCancellation") &&
      mapping.isVoided === false &&
      mapping.encounterTypeUUID === encounterType.uuid
  );

export const findProgramEnrolmentForm = (formMappings, program) =>
  formMappings.find(
    mapping => mapping.formType === "ProgramEnrolment" && mapping.isVoided === false && mapping.programUUID === program.uuid
  );

export const findProgramExitForm = (formMappings, program) =>
  formMappings.find(mapping => mapping.formType === "ProgramExit" && mapping.isVoided === false && mapping.programUUID === program.uuid);

export const findRegistrationForm = (formMappings, subjectType) =>
  formMappings.find(
    mapping => mapping.formType === "IndividualProfile" && mapping.isVoided === false && mapping.subjectTypeUUID === subjectType.uuid
  );

const findFormsOfType = (formList = [], formType = "IndividualProfile") => formList.filter(form => form.formType === formType);

export const findRegistrationForms = (formList = []) => findFormsOfType(formList, "IndividualProfile");

export const findProgramEncounterForms = (formList = []) => findFormsOfType(formList, "ProgramEncounter");

export const findEncounterForms = (formList = []) => findFormsOfType(formList, "Encounter");

export const findProgramEncounterCancellationForms = (formList = []) => findFormsOfType(formList, "ProgramEncounterCancellation");

export const findEncounterCancellationForms = (formList = []) => findFormsOfType(formList, "IndividualEncounterCancellation");

export const findProgramEnrolmentForms = (formList = []) => findFormsOfType(formList, "ProgramEnrolment");

export const findProgramExitForms = (formList = []) => findFormsOfType(formList, "ProgramExit");

export const findFormUuidForSubjectType = (subjectType, formMappings = []) =>
  get(
    find(formMappings, ({ formType, subjectTypeUUID }) => formType === "IndividualProfile" && subjectTypeUUID === get(subjectType, "uuid")),
    "formUUID"
  );
