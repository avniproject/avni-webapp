export const findProgramEncounterForm = (formMappings, encounterType) =>
  formMappings.find(
    mapping =>
      mapping.formType === "ProgramEncounter" &&
      mapping.isVoided === false &&
      mapping.encounterTypeUUID === encounterType.uuid
  );

export const findProgramEncounterCancellationForm = (formMappings, encounterType) =>
  formMappings.find(
    mapping =>
      mapping.formType === "ProgramEncounterCancellation" &&
      mapping.isVoided === false &&
      mapping.encounterTypeUUID === encounterType.uuid
  );

export const findProgramEnrolmentForm = (formMappings, program) =>
  formMappings.find(
    mapping =>
      mapping.formType === "ProgramEnrolment" &&
      mapping.isVoided === false &&
      mapping.programUUID === program.uuid
  );

export const findProgramExitForm = (formMappings, program) =>
  formMappings.find(
    mapping =>
      mapping.formType === "ProgramExit" &&
      mapping.isVoided === false &&
      mapping.programUUID === program.uuid
  );

export const findRegistrationForm = (formMappings, subjectType) =>
  formMappings.find(
    mapping =>
      mapping.formType === "IndividualProfile" &&
      mapping.isVoided === false &&
      mapping.subjectTypeUUID === subjectType.uuid
  );

const findFormsOfType = (formList = [], formType = "IndividualProfile") =>
  formList.filter(form => form.formType === formType);

export const findRegistrationForms = (formList = []) =>
  findFormsOfType(formList, "IndividualProfile");

export const findProgramEncounterForms = (formList = []) =>
  findFormsOfType(formList, "ProgramEncounter");

export const findProgramEncounterCancellationForms = (formList = []) =>
  findFormsOfType(formList, "ProgramEncounterCancellation");

export const findProgramEnrolmentForms = (formList = []) =>
  findFormsOfType(formList, "ProgramEnrolment");

export const findProgramExitForms = (formList = []) => findFormsOfType(formList, "ProgramExit");
