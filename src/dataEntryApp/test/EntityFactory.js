import {
  Concept,
  Program,
  ModelGeneral as General,
  ChecklistItem,
  Observation,
  PrimitiveValue,
  ProgramEncounter,
  ProgramEnrolment,
  Individual,
  ConceptAnswer,
  EncounterType,
  KeyValue
} from "openchs-models";

import _ from "lodash";
import WebFormElement from "../../common/model/WebFormElement";
import WebFormElementGroup from "../../common/model/WebFormElementGroup";
import WebForm from "../../common/model/WebForm";
import moment from "moment";

class EntityFactory {
  static createSafeProgram(name) {
    const program = new Program();
    program.uuid = General.randomUUID();
    program.name = name;
    return program;
  }

  static createIndividual(name) {
    let individual = new Individual();
    individual.uuid = General.randomUUID();
    individual.name = name;
    return individual;
  }

  static createSubject({
    uuid = General.randomUUID(),
    subjectType,
    firstName,
    lastName,
    address,
    registrationDate = moment().toDate(),
    observations = [],
    approvalStatuses = []
  }) {
    const subject = new Individual();
    subject.uuid = uuid;
    subject.subjectType = subjectType;
    subject.firstName = firstName;
    subject.lastName = lastName;
    subject.name = firstName;
    subject.lowestAddressLevel = address;
    subject.registrationDate = registrationDate;
    subject.observations = observations;
    subject.approvalStatuses = approvalStatuses;
    subject.setLatestEntityApprovalStatus(subject.latestEntityApprovalStatus);
    return subject;
  }

  static createSafeFormElementGroup(form) {
    const formElementGroup = new WebFormElementGroup();
    formElementGroup.formElements = [];
    formElementGroup.form = form;
    form.addFormElementGroup(formElementGroup);
    return formElementGroup;
  }

  static createFormElementGroup(name, displayOrder, form) {
    return EntityFactory.createFormElementGroup2({
      name: name,
      displayOrder: displayOrder,
      form: form
    });
  }

  static createFormElementGroup2({ name, displayOrder, form }) {
    const formElementGroup = EntityFactory.createSafeFormElementGroup(form);
    formElementGroup.name = name;
    formElementGroup.displayOrder = displayOrder;
    return formElementGroup;
  }

  static createForm(name) {
    return EntityFactory.createForm2({ name });
  }

  static createForm2({ uuid, formType, name, formElementGroups = [] }) {
    const form = new WebForm();
    form.uuid = uuid;
    form.formType = formType;
    form.name = name;
    form.formElementGroups = formElementGroups;
    return form;
  }

  static createFormElement(name, mandatory, concept, displayOrder, type, formElementGroup, keyValues) {
    return EntityFactory.createFormElement2({
      name: name,
      mandatory: mandatory,
      concept: concept,
      displayOrder: displayOrder,
      type: type,
      formElementGroup: formElementGroup,
      keyValues: keyValues
    });
  }

  static createFormElement2({
    uuid = General.randomUUID(),
    name = General.randomUUID(),
    displayOrder,
    concept,
    formElementGroup = new WebFormElementGroup(),
    mandatory = true,
    keyValues = [],
    type,
    group
  }) {
    const entity = new WebFormElement();
    entity.uuid = uuid;
    entity.name = name;
    entity.concept = concept;
    entity.displayOrder = displayOrder;
    entity.formElementGroup = formElementGroup;
    entity.mandatory = mandatory;
    entity.keyValues = keyValues;
    formElementGroup.formElements = [...(formElementGroup.formElements || []), entity];
    entity.type = type;
    entity.groupUuid = _.get(group, "uuid");
    entity.group = group;
    return entity;
  }

  static addCodedAnswers(concept, answers) {
    _.forEach(answers, answer => concept.addAnswer(EntityFactory.createConcept(answer, Concept.dataType.NA)));
  }

  static createConcept(name, dataType, uuid) {
    const concept = Concept.create(name, dataType);
    concept.uuid = uuid || General.randomUUID();
    if (dataType === Concept.dataType.Coded) concept.answers = [];
    return concept;
  }

  static createConcept2({ uuid, dataType, name, answers = [], keyValues = [] } = { answers: [] }) {
    const concept = new Concept();
    concept.name = name;
    concept.uuid = uuid;
    concept.datatype = dataType;
    concept.answers = [];
    concept.keyValues = _.map(keyValues, KeyValue.fromResource);
    answers.forEach(x => concept.addAnswer(x));
    return concept;
  }

  static createAnswerConcept(concept, answerOrder) {
    let conceptAnswer = new ConceptAnswer();
    conceptAnswer.uuid = General.randomUUID();
    conceptAnswer.concept = concept;
    conceptAnswer.answerOrder = answerOrder;
    return conceptAnswer;
  }

  static addChecklistItem(checklist, name, dueDate) {
    const item = ChecklistItem.create();
    item.concept = Concept.create(name, Concept.dataType.NA);
    item.dueDate = dueDate;
    checklist.addItem(item);
    return item;
  }

  static createObservation(concept, primitiveValue) {
    return Observation.create(concept, new PrimitiveValue(primitiveValue));
  }

  static createDecision(name, value) {
    const decision = {};
    decision.name = name;
    decision.value = value;
    return decision;
  }

  static createProgramEncounter({ programEnrolment, encounterDateTime = new Date(), observations = [], encounterType = undefined }) {
    const programEncounter = ProgramEncounter.createEmptyInstance();
    const encounterTypeObj = EncounterType.create(encounterType);
    programEncounter.encounterDateTime = encounterDateTime;
    programEncounter.observations = observations;
    programEncounter.encounterType = encounterTypeObj;
    programEncounter.programEnrolment = programEnrolment;
    return programEncounter;
  }

  static createEnrolment({ enrolmentDateTime = new Date(), uuid, programExitDateTime, program = null, observations = [], individual }) {
    const programEnrolment = ProgramEnrolment.createEmptyInstance();
    programEnrolment.enrolmentDateTime = enrolmentDateTime;
    programEnrolment.program = program;
    programEnrolment.programExitDateTime = programExitDateTime;
    programEnrolment.observations = observations;
    programEnrolment.individual = individual;
    programEnrolment.uuid = uuid || programEnrolment.uuid;
    return programEnrolment;
  }

  static createProgram = function({ uuid = General.randomUUID(), name = null }) {
    const program = new Program();
    program.uuid = uuid;
    program.name = name;
    return program;
  };
}

export default EntityFactory;
