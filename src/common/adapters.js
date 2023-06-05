import {
  Concept,
  ConceptAnswer,
  EncounterType,
  Form,
  Format,
  FormElement,
  FormElementGroup,
  Gender,
  KeyValue,
  ModelGeneral as General,
  OrganisationConfig,
  Program,
  SubjectType
} from "avni-models";
import { get, isEmpty, isNil, map } from "lodash";
import { conceptService } from "dataEntryApp/services/ConceptService";

export const mapConceptAnswer = json => {
  const conceptAnswer = new ConceptAnswer();
  conceptAnswer.uuid = json.uuid;
  conceptAnswer.answerOrder = json.order;
  conceptAnswer.abnormal = json.abnormal;
  conceptAnswer.unique = json.unique;
  conceptAnswer.voided = !!json.voided;
  conceptAnswer.concept = mapConcept(json.answerConcept);
  return conceptAnswer;
};

export const mapConcept = json => {
  const concept = Concept.fromResource(json);
  concept.answers = map(json.conceptAnswers, mapConceptAnswer);
  conceptService.addConcept(concept);
  return concept;
};

export const mapFormElement = (json, formElementGroup) => {
  const formElement = General.assignFields(
    json,
    new FormElement(),
    ["uuid", "name", "displayOrder", "mandatory", "type", "voided", "rule"],
    []
  );
  formElement.formElementGroup = formElementGroup;
  formElement.keyValues = map(json.keyValues, KeyValue.fromResource);
  formElement.validFormat = Format.fromResource(json.validFormat);
  formElement.concept = mapConcept(json.concept);
  if (json.group) formElement.groupUuid = json.group.uuid;
  return formElement;
};

export const mapFormElementGroup = (json, form) => {
  const formElementGroup = General.assignFields(json, new FormElementGroup(), [
    "uuid",
    "name",
    "displayOrder",
    "display",
    "voided",
    "rule"
  ]);
  formElementGroup.formElements = map(json.applicableFormElements, feJson =>
    mapFormElement(feJson, formElementGroup)
  );
  formElementGroup.form = form;
  return formElementGroup;
};

export const mapForm = json => {
  let form = General.assignFields(json, new Form(), ["uuid", "name", "formType"]);
  form.formElementGroups = map(json.formElementGroups, fegJson =>
    mapFormElementGroup(fegJson, form)
  );
  return form;
};

export const mapGender = json => General.assignFields(json, new Gender(), ["uuid", "name"]);

export const mapEncounterType = json => {
  const encounterType = new EncounterType();
  encounterType.name = json.name;
  encounterType.uuid = json.uuid;
  encounterType.voided = false;
  encounterType.operationalEncounterTypeName = json.operationalEncounterTypeName;
  encounterType.displayName = isEmpty(encounterType.operationalEncounterTypeName)
    ? encounterType.name
    : encounterType.operationalEncounterTypeName;
  return encounterType;
};

export const mapProgram = json => {
  const program = new Program();
  program.uuid = json.uuid;
  program.name = json.name;
  program.operationalProgramName = json.operationalProgramName;
  program.colour = isNil(json.colour) ? Program.randomColour() : json.colour;
  program.displayName = isEmpty(program.operationalProgramName)
    ? program.name
    : program.operationalProgramName;
  program.programSubjectLabel =
    json.programSubjectLabel || json.operationalProgramName || program.name;
  return program;
};

export const mapSubjectType = json => {
  const subjectType = new SubjectType();
  if (isNil(json)) {
    return subjectType;
  }
  subjectType.name = json.operationalSubjectTypeName || json.name;
  subjectType.uuid = json.uuid;
  subjectType.voided = !!json.voided;
  subjectType.type = json.type;
  subjectType.allowEmptyLocation = json.allowEmptyLocation;
  subjectType.validFirstNameFormat = Format.fromResource(json.validFirstNameFormat);
  subjectType.validMiddleNameFormat = Format.fromResource(json.validMiddleNameFormat);
  subjectType.validLastNameFormat = Format.fromResource(json.validLastNameFormat);
  subjectType.allowMiddleName = json.allowMiddleName;
  subjectType.lastNameOptional = json.lastNameOptional;
  subjectType.allowProfilePicture = json.allowProfilePicture;
  subjectType.group = json.group;
  subjectType.household = json.household;
  subjectType.iconFileS3Key = json.iconFileS3Key;
  subjectType.nameHelpText = json.nameHelpText;
  return subjectType;
};

export const mapOperationalModules = json => ({
  formMappings: json.formMappings,
  encounterTypes: json.encounterTypes.map(mapEncounterType),
  programs: json.programs.map(mapProgram),
  subjectTypes: json.subjectTypes.map(mapSubjectType),
  addressLevelTypes: json.addressLevelTypes,
  forms: json.forms,
  customRegistrationLocations: json.customRegistrationLocations,
  relations: json.relations,
  allAddressLevels: json.allAddressLevels
});

export const mapOrganisationConfig = json => {
  let fromResource = OrganisationConfig.fromResource(get(json, "_embedded.organisationConfig.0"));
  return fromResource;
};
