import { filter, intersectionWith, isEmpty } from "lodash";

export const initialState = {
  reportType: "",
  subjectType: {},
  program: {},
  encounterType: {},
  startDate: new Date(),
  endDate: new Date(),
  addressLevelIds: [],
  addressLevelError: "",
  includeVoided: false
};

export function ExportReducer(exportRequest, action) {
  switch (action.type) {
    case "reportType":
      return { ...initialState, reportType: action.payload };
    case "subjectType":
      return { ...initialState, reportType: exportRequest.reportType, subjectType: action.payload };
    case "program":
      return {
        ...initialState,
        reportType: exportRequest.reportType,
        subjectType: exportRequest.subjectType,
        program: action.payload
      };
    case "encounterType":
      return { ...exportRequest, encounterType: action.payload };
    case "startDate":
      return { ...exportRequest, startDate: action.payload };
    case "endDate":
      return { ...exportRequest, endDate: action.payload };
    case "addressLevelIds":
      return { ...exportRequest, addressLevelIds: action.payload };
    case "AddressLevelError":
      return { ...exportRequest, addressLevelError: action.payload };
    case "includeVoided":
      return { ...exportRequest, includeVoided: action.payload };
    default:
      return exportRequest;
  }
}

export const applicableOptions = (
  { programs, formMappings, encounterTypes },
  { subjectType, program }
) => {
  const validFormMappings = filter(
    formMappings,
    ({ subjectTypeUUID }) => subjectTypeUUID === subjectType.uuid
  );
  const programOptions = intersectionWith(
    programs,
    validFormMappings,
    (a, b) => a.uuid === b.programUUID
  );
  if (isEmpty(programOptions)) {
    const encounterTypeOptions = intersectionWith(
      encounterTypes,
      validFormMappings,
      (a, b) => a.uuid === b.encounterTypeUUID
    );
    return { programOptions, encounterTypeOptions };
  } else {
    const validFMForSelectedProgram = filter(
      formMappings,
      ({ programUUID }) => programUUID === program.uuid
    );
    const encounterTypeOptions = intersectionWith(
      encounterTypes,
      validFMForSelectedProgram,
      (a, b) => a.uuid === b.encounterTypeUUID
    );
    return { programOptions, encounterTypeOptions };
  }
};
