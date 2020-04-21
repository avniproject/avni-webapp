export const findProgramEncounterCancellationForm = (formMappings, encounterType) =>
  formMappings.find(
    mapping =>
      mapping.formType === "ProgramEncounterCancellation" &&
      mapping.isVoided === false &&
      mapping.encounterTypeUUID === encounterType.uuid
  );

export const findProgramEncounterForm = (formMappings, encounterType) =>
  formMappings.find(
    mapping =>
      mapping.formType === "ProgramEncounter" &&
      mapping.isVoided === false &&
      mapping.encounterTypeUUID === encounterType.uuid
  );

export const findRegistrationForm = (formMappings, subjectType) =>
  formMappings.find(
    mapping =>
      mapping.formType === "IndividualProfile" &&
      mapping.isVoided === false &&
      mapping.subjectTypeUUID === subjectType.uuid
  );

export const findRegistrationForms = (formList = []) =>
  formList.filter(form => form.formType === "IndividualProfile");

export const findProgramEncounterForms = (formList = []) =>
  formList.filter(form => form.formType === "ProgramEncounter");

export const findProgramEncounterCancellationForms = (formList = []) =>
  formList.filter(form => form.formType === "ProgramEncounterCancellation");
