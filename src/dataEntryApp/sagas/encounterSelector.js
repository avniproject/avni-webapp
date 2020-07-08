import { find, get, isNil, filter } from "lodash";

export const selectFormMappingForSubjectType = subjectTypeUuid => state => {
  return filter(
    get(state, "dataEntry.metadata.operationalModules.formMappings"),
    fm =>
      isNil(fm.programUUID) &&
      (fm.subjectTypeUUID === subjectTypeUuid && fm.formType === "Encounter")
  );
};
