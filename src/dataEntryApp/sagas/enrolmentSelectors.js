import { find, get, isNil } from "lodash";

export const selectEnrolSubjectTypeFromName = subjectTypeName => (
  state //Individual
) =>
  find(
    get(state, "dataEntry.metadata.operationalModules.subjectTypes"),
    subjectType => subjectType.name === subjectTypeName
  );

export const selectProgram = programName => state =>
  find(
    get(state, "dataEntry.metadata.operationalModules.programs"),
    program => program.name === programName
  );

//it is returning another funciton
export const selectEnrolmentFormMapping = (subjectType, programUuid) => state =>
  find(
    //get takes state from store you can print this
    get(state, "dataEntry.metadata.operationalModules.formMappings"),
    (
      fm //this is function fm is parameter it is just like map form uuid from saga
    ) =>
      !isNil(fm.programUUID) &&
      (fm.subjectTypeUUID === subjectType.uuid &&
        fm.programUUID === programUuid &&
        fm.formType === "ProgramEnrolment")
    //&&
    //fm.formUUID === "23d8763d-4759-4c7d-bb46-d57a1ee58673"
  );

//For retriving the program uuid from program name
export const selectProgramUUID = programName => state =>
  find(
    //get takes state from store you can print this
    get(state, "dataEntry.metadata.operationalModules.programs"),
    (
      fm //this is function fm is parameter it is just like map form uuid from saga
    ) => fm.displayName === programName
  );

export const selectEnrolmentFormMappingForSubjectType = (subjectTypeName, programName) => state => {
  const program = selectProgramUUID(programName)(state);
  return selectEnrolmentFormMapping(
    selectEnrolSubjectTypeFromName(subjectTypeName)(state),
    program.uuid
  )(state);
};

export const selectEnrolmentSubject = state =>
  get(state, "dataEntry.enrolmentReducer.programEnrolment");
