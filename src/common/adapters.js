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
  return concept;
};

export const mapFormElement = (json, formElementGroup) => {
  const formElement = General.assignFields(
    json,
    new FormElement(),
    ["uuid", "name", "displayOrder", "mandatory", "type", "voided"],
    []
  );
  formElement.formElementGroup = formElementGroup;
  formElement.keyValues = map(json.keyValues, KeyValue.fromResource);
  formElement.validFormat = Format.fromResource(json.validFormat);
  formElement.concept = mapConcept(json.concept);
  return formElement;
};

export const mapFormElementGroup = (json, form) => {
  const formElementGroup = General.assignFields(json, new FormElementGroup(), [
    "uuid",
    "name",
    "displayOrder",
    "display",
    "voided"
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
  subjectType.name = json.operationalSubjectTypeName;
  subjectType.uuid = json.uuid;
  subjectType.voided = !!json.voided;
  return subjectType;
};

export const mapOperationalModules = json => ({
  formMappings: json.formMappings,
  encounterTypes: json.encounterTypes.map(mapEncounterType),
  programs: json.programs.map(mapProgram),
  subjectTypes: json.subjectTypes.map(mapSubjectType)
});

export const mapOrganisationConfig = json => {
  let fromResource = OrganisationConfig.fromResource(get(json, "_embedded.organisationConfig.0"));
  return fromResource;
};
