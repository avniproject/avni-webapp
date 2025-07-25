import { filter, intersectionWith, isEmpty } from "lodash";
import ReportTypes from "../ReportTypes";
import { startOfDay, endOfDay, isValid } from "date-fns";

export const initialState = {
  reportType: "",
  subjectType: {},
  program: {},
  encounterType: {},
  startDate: new Date(),
  endDate: new Date(),
  addressLevelIds: [],
  addressLevelError: "",
  includeVoided: false,
  customRequest: {}
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
    case "customRequest":
      return { ...exportRequest, customRequest: action.payload };
    default:
      return exportRequest;
  }
}

export const applicableOptions = ({ programs, formMappings, encounterTypes }, { subjectType, program }) => {
  const validFormMappings = filter(formMappings, ({ subjectTypeUUID }) => subjectTypeUUID === subjectType.uuid);
  const programOptions = intersectionWith(programs, validFormMappings, (a, b) => a.uuid === b.programUUID);
  if (isEmpty(programOptions)) {
    const encounterTypeOptions = intersectionWith(encounterTypes, validFormMappings, (a, b) => a.uuid === b.encounterTypeUUID);
    return { programOptions, encounterTypeOptions };
  } else {
    const validFMForSelectedProgram = filter(formMappings, ({ programUUID }) => programUUID === program.uuid);
    const encounterTypeOptions = intersectionWith(encounterTypes, validFMForSelectedProgram, (a, b) => a.uuid === b.encounterTypeUUID);
    return { programOptions, encounterTypeOptions };
  }
};

export const getRequestBody = ({ reportType, subjectType, program, encounterType, startDate, endDate, addressLevelIds, includeVoided }) => {
  return {
    subjectTypeUUID: subjectType.uuid,
    programUUID: program.uuid,
    encounterTypeUUID: encounterType.uuid,
    startDate: isValid(new Date(startDate)) ? startOfDay(new Date(startDate)) : null,
    endDate: isValid(new Date(endDate)) ? endOfDay(new Date(endDate)) : null,
    reportType: ReportTypes.getCode(reportType.name),
    addressLevelIds: addressLevelIds,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    includeVoided
  };
};

export const getNewRequestBody = ({
  reportType,
  subjectType,
  program,
  encounterType,
  startDate,
  endDate,
  addressLevelIds,
  includeVoided
}) => {
  const output = {};
  const filters = {
    addressLevelIds: addressLevelIds,
    date: {
      from: isValid(new Date(startDate)) ? startOfDay(new Date(startDate)) : null,
      to: isValid(new Date(endDate)) ? endOfDay(new Date(endDate)) : null
    },
    includeVoided
  };
  if (!isEmpty(subjectType)) {
    output.uuid = subjectType.uuid;
    if (reportType.name === "GroupSubject") {
      output.membershipExport = true;
    }
  }
  if (!isEmpty(encounterType) && isEmpty(program)) {
    output.encounters = [{ uuid: encounterType.uuid }];
  }
  if (!isEmpty(program)) {
    output.programs = [{ uuid: program.uuid }];
    if (!isEmpty(encounterType)) {
      output.programs = [{ uuid: program.uuid, encounters: [{ uuid: encounterType.uuid }] }];
    }
  }
  return { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, output, filters };
};
