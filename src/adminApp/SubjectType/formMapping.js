export const findRegistrationForm = (formMappings, subjectType) =>
  formMappings.find(
    mapping =>
      mapping.formType === "IndividualProfile" &&
      mapping.isVoided === false &&
      mapping.subjectTypeUUID === subjectType.uuid
  );
