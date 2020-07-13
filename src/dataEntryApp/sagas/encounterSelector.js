import { find, get, isNil, filter } from "lodash";

export const selectFormMappingsForSubjectType = subjectTypeUuid => state => {
  return filter(
    get(state, "dataEntry.metadata.operationalModules.formMappings"),
    fm =>
      isNil(fm.programUUID) &&
      (fm.subjectTypeUUID === subjectTypeUuid && fm.formType === "Encounter")
  );
};

export const selectFormMappingForEncounter = encounterTypeUuid => state =>
  find(
    get(state, "dataEntry.metadata.operationalModules.formMappings"),
    fm =>
      !isNil(encounterTypeUuid) &&
      (fm.encounterTypeUUID === encounterTypeUuid && fm.formType === "Encounter")
  );
