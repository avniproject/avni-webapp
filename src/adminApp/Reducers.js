import Types from "./SubjectType/Types";
import { isEmpty, map } from "lodash";
import WebSubjectType from "../common/model/WebSubjectType";

function getUpdatedProgram(program, action) {
  let newProgram = { ...program };
  newProgram[action.type] = action.payload;
  return newProgram;
}

export function programReducer(program, action) {
  switch (action.type) {
    case "setLoaded":
      return { ...program, loaded: true };
    case "setData":
      return {
        ...program,
        name: action.payload.name,
        colour: action.payload.colour,
        programSubjectLabel: action.payload.programSubjectLabel,
        enrolmentSummaryRule: action.payload.enrolmentSummaryRule,
        enrolmentEligibilityCheckRule: action.payload.enrolmentEligibilityCheckRule,
        enrolmentEligibilityCheckDeclarativeRule: action.payload.enrolmentEligibilityCheckDeclarativeRule,
        manualEnrolmentEligibilityCheckRule: action.payload.manualEnrolmentEligibilityCheckRule,
        manualEligibilityCheckRequired: action.payload.manualEligibilityCheckRequired,
        allowMultipleEnrolments: action.payload.allowMultipleEnrolments,
        manualEnrolmentEligibilityCheckDeclarativeRule: action.payload.manualEnrolmentEligibilityCheckDeclarativeRule,
        active: action.payload.active,
        loaded: true,
        programId: action.payload.programId
      };
    case "":
      return program;
    default:
      return getUpdatedProgram(program, action);
  }
}

export function encounterTypeReducer(encounterType, action) {
  switch (action.type) {
    case "name":
      return { ...encounterType, name: action.payload };
    case "active":
      return { ...encounterType, active: action.payload };
    case "encounterEligibilityCheckRule":
      return { ...encounterType, encounterEligibilityCheckRule: action.payload };
    case "programEncounterForm":
      return { ...encounterType, programEncounterForm: action.payload };
    case "programEncounterCancellationForm":
      return { ...encounterType, programEncounterCancellationForm: action.payload };
    case "encounterEligibilityCheckDeclarativeRule":
      return { ...encounterType, encounterEligibilityCheckDeclarativeRule: action.payload };
    case "setLoaded":
      return { ...encounterType, loaded: true };
    case "setData":
      return {
        ...encounterType,
        loaded: true,
        ...action.payload
      };
    case "setImmutable":
      return { ...encounterType, immutable: action.payload };
    default:
      return encounterType;
  }
}

export function subjectTypeReducer(subjectType, action) {
  switch (action.type) {
    case "name":
      return { ...subjectType, name: action.payload };
    case "group":
      return { ...subjectType, group: action.payload.group, groupRoles: action.payload.groupRoles };
    case "household":
      return {
        ...subjectType,
        group: action.payload.group,
        household: action.payload.household,
        groupRoles: action.payload.groupRoles
      };
    case "groupRole":
      return { ...subjectType, groupRoles: action.payload };
    case "registrationForm":
      return { ...subjectType, registrationForm: action.payload };
    case "active":
      return { ...subjectType, active: action.payload };
    case "type":
      const type = action.payload;
      const { groupRoles, memberSubjectType } = WebSubjectType.updateType(subjectType, type);
      return { ...subjectType, type, groupRoles, memberSubjectType };
    case "householdMemberSubject":
      const roles = map(subjectType.groupRoles, ({ groupRoleUUID, role, minimumNumberOfMembers, maximumNumberOfMembers }) => ({
        subjectMemberName: action.payload,
        groupRoleUUID,
        role,
        minimumNumberOfMembers,
        maximumNumberOfMembers
      }));
      return { ...subjectType, groupRoles: roles, memberSubjectType: action.payload };
    case "setData":
      return {
        ...subjectType,
        ...action.payload,
        memberSubjectType: Types.isHousehold(action.payload.type)
          ? map(action.payload.groupRoles, ({ subjectMemberName }) => subjectMemberName)[0]
          : ""
      };
    case "subjectSummaryRule":
      return { ...subjectType, subjectSummaryRule: action.payload };
    case "programEligibilityCheckRule":
      return { ...subjectType, programEligibilityCheckRule: action.payload };
    case "locationTypes":
      return { ...subjectType, locationTypeUUIDs: action.payload };
    case "allowEmptyLocation":
      return { ...subjectType, allowEmptyLocation: action.payload };
    case "allowProfilePicture":
      return { ...subjectType, allowProfilePicture: action.payload };
    case "uniqueName":
      return { ...subjectType, uniqueName: action.payload };
    case "validFirstNameRegex":
      return {
        ...subjectType,
        validFirstNameFormat: {
          ...subjectType.validFirstNameFormat,
          regex: _getNullOrValue(action.payload)
        }
      };
    case "validFirstNameDescriptionKey":
      return {
        ...subjectType,
        validFirstNameFormat: {
          ...subjectType.validFirstNameFormat,
          descriptionKey: _getNullOrValue(action.payload)
        }
      };
    case "allowMiddleName":
      return { ...subjectType, allowMiddleName: action.payload };
    case "lastNameOptional":
      return { ...subjectType, lastNameOptional: action.payload };
    case "validMiddleNameRegex":
      return {
        ...subjectType,
        validMiddleNameFormat: {
          ...subjectType.validMiddleNameFormat,
          regex: _getNullOrValue(action.payload)
        }
      };
    case "validMiddleNameDescriptionKey":
      return {
        ...subjectType,
        validMiddleNameFormat: {
          ...subjectType.validMiddleNameFormat,
          descriptionKey: _getNullOrValue(action.payload)
        }
      };
    case "validLastNameRegex":
      return {
        ...subjectType,
        validLastNameFormat: {
          ...subjectType.validLastNameFormat,
          regex: _getNullOrValue(action.payload)
        }
      };
    case "validLastNameDescriptionKey":
      return {
        ...subjectType,
        validLastNameFormat: {
          ...subjectType.validLastNameFormat,
          descriptionKey: _getNullOrValue(action.payload)
        }
      };
    case "syncAttribute":
      const { name, value } = action.payload;
      return {
        ...subjectType,
        [name]: value
      };
    case "nameHelpText":
      return {
        ...subjectType,
        nameHelpText: action.payload
      };
    case "settings":
      return {
        ...subjectType,
        settings: { ...subjectType.settings, [action.payload.setting]: action.payload.value }
      };
    default:
      return subjectType;
  }
}

const _getNullOrValue = value => (isEmpty(value) ? null : value);
