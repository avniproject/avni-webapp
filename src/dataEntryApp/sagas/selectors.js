import { find, get, isNil } from "lodash";

export const selectSubjectTypeFromName = subjectTypeName => state =>
  find(
    get(state, "dataEntry.metadata.operationalModules.subjectTypes"),
    subjectType => subjectType.name === subjectTypeName
  );

export const selectRegistrationFormMapping = subjectType => state =>
  find(
    get(state, "dataEntry.metadata.operationalModules.formMappings"),
    fm =>
      isNil(fm.programUuid) &&
      isNil(fm.encounterTypeUuid) &&
      fm.subjectTypeUuid === subjectType.uuid
  );

export const selectRegistrationFormMappingForSubjectType = subjectTypeName => state =>
  selectRegistrationFormMapping(selectSubjectTypeFromName(subjectTypeName)(state))(state);

export const selectRegistrationSubject = state => get(state, "dataEntry.registration.subject");
