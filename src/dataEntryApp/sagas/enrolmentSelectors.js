import { find, get, isNil } from "lodash";

export const selectEnrolSubjectTypeFromName = subjectTypeName => state =>
  find(
    get(state, "dataEntry.metadata.operationalModules.subjectTypes"),
    subjectType => subjectType.name === subjectTypeName
  );

export const selectProgram = programName => state =>
  find(
    get(state, "dataEntry.metadata.operationalModules.programs"),
    program => program.operationalProgramName === programName
  );

export const selectEnrolmentFormMapping = (subjectType, programUuid, formType) => state =>
  find(
    get(state, "dataEntry.metadata.operationalModules.formMappings"),
    fm =>
      !isNil(fm.programUUID) &&
      (fm.subjectTypeUUID === subjectType.uuid &&
        fm.programUUID === programUuid &&
        fm.formType === formType)
  );

export const selectProgramUUID = programName => state =>
  find(
    get(state, "dataEntry.metadata.operationalModules.programs"),
    program => program.operationalProgramName === programName
  );

export const selectEnrolmentFormMappingForSubjectType = (
  subjectTypeName,
  programName,
  formType
) => state => {
  const program = selectProgramUUID(programName)(state);

  return selectEnrolmentFormMapping(
    selectEnrolSubjectTypeFromName(subjectTypeName)(state),
    program.uuid,
    formType
  )(state);
};

export const selectProgramEnrolment = state =>
  get(state, "dataEntry.enrolmentReducer.programEnrolment");
