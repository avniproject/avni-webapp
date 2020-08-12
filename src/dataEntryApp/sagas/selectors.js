import { find, get, isNil, some, filter } from "lodash";

export const selectSubjectTypeFromName = subjectTypeName => state =>
  find(
    get(state, "dataEntry.metadata.operationalModules.subjectTypes"),
    subjectType => subjectType.name === subjectTypeName
  );
//it is returning another funciton
export const selectRegistrationFormMapping = subjectType => state =>
  find(
    //get takes state from store you can print this
    get(state, "dataEntry.metadata.operationalModules.formMappings"),
    fm =>
      isNil(fm.programUUID) &&
      isNil(fm.encounterTypeUUID) &&
      fm.subjectTypeUUID === subjectType.uuid
  );

export const selectRegistrationFormMappingForSubjectType = subjectTypeName => state =>
  selectRegistrationFormMapping(selectSubjectTypeFromName(subjectTypeName)(state))(state);

export const selectRegistrationSubject = state => get(state, "dataEntry.registration.subject");

export const selectSubjectProfile = state => get(state, "dataEntry.subjectProfile.subjectProfile");

export const selectProgramEncounterTypes = (subjectTypeUuid, programUuid) => state => {
  const formMappings = filter(
    get(state, "dataEntry.metadata.operationalModules.formMappings"),
    fm =>
      fm.subjectTypeUUID === subjectTypeUuid &&
      fm.programUUID === programUuid &&
      fm.formType === "ProgramEncounter"
  );

  const encounterTypes = filter(
    get(state, "dataEntry.metadata.operationalModules.encounterTypes"),
    encounterType => some(formMappings, fm => fm.encounterTypeUUID === encounterType.uuid)
  );

  return encounterTypes;
};

export const selectGeneralEncounterTypes = subjectTypeUuid => state => {
  const formMappings = filter(
    get(state, "dataEntry.metadata.operationalModules.formMappings"),
    fm => fm.subjectTypeUUID === subjectTypeUuid && fm.formType === "Encounter"
  );

  const encounterTypes = filter(
    get(state, "dataEntry.metadata.operationalModules.encounterTypes"),
    encounterType => some(formMappings, fm => fm.encounterTypeUUID === encounterType.uuid)
  );

  return encounterTypes;
};

export const selectEnableReadonly = state => {
  let enableReadonly = true;
  if (state.app.userInfo.settings && state.app.userInfo.settings.dataEntryAppEnableWrites) {
    enableReadonly = false;
  }
  return enableReadonly;
};
