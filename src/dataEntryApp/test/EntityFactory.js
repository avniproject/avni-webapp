import {
  FormElementGroup,
  Form,
  FormElement,
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
  EncounterType
} from "openchs-models";

import _ from "lodash";

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

  static createSafeFormElementGroup(form) {
    const formElementGroup = new FormElementGroup();
    formElementGroup.formElements = [];
    formElementGroup.form = form;
    form.addFormElementGroup(formElementGroup);
    return formElementGroup;
  }

  static createFormElementGroup(name, displayOrder, form) {
    const formElementGroup = EntityFactory.createSafeFormElementGroup(form);
    formElementGroup.name = name;
    formElementGroup.displayOrder = displayOrder;
    return formElementGroup;
  }

  static createForm(name) {
    const form = new Form();
    form.name = name;
    form.formElementGroups = [];
    return form;
  }

  static createFormElement(name, mandatory, concept, displayOrder, type, formElementGroup) {
    const formElement = new FormElement();
    formElement.uuid = General.randomUUID();
    formElement.name = name;
    formElement.mandatory = mandatory;
    formElement.concept = concept;
    formElement.displayOrder = displayOrder;
    formElement.type = type;
    formElement.formElementGroup = formElementGroup;
    return formElement;
  }

  static addCodedAnswers(concept, answers) {
    _.forEach(answers, answer =>
      concept.addAnswer(EntityFactory.createConcept(answer, Concept.dataType.NA))
    );
  }

  static createConcept(name, dataType, uuid) {
    const concept = Concept.create(name, dataType);
    concept.uuid = uuid || General.randomUUID();
    if (dataType === Concept.dataType.Coded) concept.answers = [];
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

  static createProgramEncounter({
    programEnrolment,
    encounterDateTime = new Date(),
    observations = [],
    encounterType = undefined
  }) {
    const programEncounter = ProgramEncounter.createEmptyInstance();
    const encounterTypeObj = EncounterType.create(encounterType);
    programEncounter.encounterDateTime = encounterDateTime;
    programEncounter.observations = observations;
    programEncounter.encounterType = encounterTypeObj;
    programEncounter.programEnrolment = programEnrolment;
    return programEncounter;
  }

  static createEnrolment({
    enrolmentDateTime = new Date(),
    uuid,
    programExitDateTime,
    program = null,
    observations = [],
    individual
  }) {
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
