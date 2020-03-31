import { find, get, isNil } from "lodash";

export const selectEnrolSubjectTypeFromName = subjectTypeName => (
  state //Individual
) =>
  find(
    get(state, "dataEntry.metadata.operationalModules.subjectTypes"),
    subjectType => subjectType.name === subjectTypeName
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
      (fm.subjectTypeUUID === subjectType.uuid && fm.programUUID === programUuid)
  );

//For retriving the program uuid from program name
export const selectProgramUUID = programName => state =>
  find(
    //get takes state from store you can print this
    get(state, "dataEntry.metadata.operationalModules.programs"),
    (
      fm //this is function fm is parameter it is just like map form uuid from saga
    ) => fm.operationalProgramName === programName
  );

export const selectEnrolmentFormMappingForSubjectType = (subjectTypeName, programName) => state => {
  //debugger;
  const program = selectProgramUUID(programName)(state);
  //debugger;
  return selectEnrolmentFormMapping(
    selectEnrolSubjectTypeFromName(subjectTypeName)(state),
    program.uuid
  )(state);
};

export const selectEnrolmentSubject = state => get(state, "dataEntry.registration.subject");
