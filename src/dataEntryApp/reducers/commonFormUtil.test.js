import commonFormUtil from "./commonFormUtil";
import { Concept, ObservationsHolder } from "openchs-models";
import EntityFactory from "../test/EntityFactory";
import { assert } from "chai";
import TestKeyValueFactory from "../test/TestKeyValueFactory";
import _ from "lodash";

describe("question group and repeatable question groups", () => {
  let qgFormElement;
  let textFormElement;
  let singleCodedFormElement;
  let answerConcept2;
  let answerConcept1;

  beforeEach(() => {
    const form = EntityFactory.createForm2({ uuid: "form-1" });
    const feg = EntityFactory.createFormElementGroup2({ uuid: "feg-1", form: form });
    const qgConcept = EntityFactory.createConcept2({
      uuid: "qg-c-1",
      dataType: Concept.dataType.QuestionGroup
    });
    const textConcept = EntityFactory.createConcept2({
      uuid: "c-1",
      name: "c-1",
      dataType: Concept.dataType.Text
    });
    answerConcept1 = EntityFactory.createConcept2({
      uuid: "ac-1",
      name: "ac-1",
      dataType: Concept.dataType.NA
    });
    answerConcept2 = EntityFactory.createConcept2({
      uuid: "ac-2",
      name: "ac-2",
      dataType: Concept.dataType.NA
    });
    const singleSelectCodedConcept = EntityFactory.createConcept2({
      uuid: "ss-1",
      name: "ss-1",
      dataType: Concept.dataType.Coded,
      answers: [answerConcept1, answerConcept2]
    });
    qgFormElement = EntityFactory.createFormElement2({
      uuid: "qg-fe-1",
      formElementGroup: feg,
      concept: qgConcept
    });
    textFormElement = EntityFactory.createFormElement2({
      uuid: "fe-1",
      formElementGroup: feg,
      concept: textConcept,
      group: qgFormElement
    });
    singleCodedFormElement = EntityFactory.createFormElement2({
      uuid: "fe-2",
      formElementGroup: feg,
      concept: singleSelectCodedConcept,
      group: qgFormElement
    });
  });

  it("should create and update question group obs", function() {
    const subject = EntityFactory.createSubject({});
    const observationsHolder = new ObservationsHolder(subject.observations);
    commonFormUtil.updateObservations(qgFormElement, "a", subject, observationsHolder, [], textFormElement, null);
    assert.equal("a", observationsHolder.findQuestionGroupObservation(textFormElement.concept, qgFormElement).getValue());
    commonFormUtil.updateObservations(qgFormElement, "b", subject, observationsHolder, [], textFormElement, null);
    assert.equal("b", observationsHolder.findQuestionGroupObservation(textFormElement.concept, qgFormElement).getValue());
    commonFormUtil.updateObservations(qgFormElement, answerConcept1.uuid, subject, observationsHolder, [], singleCodedFormElement, null);
    assert.equal(
      answerConcept1.uuid,
      observationsHolder.findQuestionGroupObservation(singleCodedFormElement.concept, qgFormElement).getValue()
    );
  });

  it("should create and update repeatable question group obs", function() {
    const keyValue = TestKeyValueFactory.create({ key: "repeatable", value: true });
    qgFormElement.keyValues = [keyValue];
    const subject = EntityFactory.createSubject({});
    const observationsHolder = new ObservationsHolder(subject.observations);
    commonFormUtil.updateObservations(qgFormElement, "a", subject, observationsHolder, [], textFormElement, 0);
    assert.equal("a", observationsHolder.findQuestionGroupObservation(textFormElement.concept, qgFormElement, 0).getValue());
    commonFormUtil.updateObservations(qgFormElement, "b", subject, observationsHolder, [], textFormElement, 0);
    assert.equal("b", observationsHolder.findQuestionGroupObservation(textFormElement.concept, qgFormElement, 0).getValue());
    commonFormUtil.updateObservations(qgFormElement, answerConcept1.uuid, subject, observationsHolder, [], singleCodedFormElement, 0);
    assert.equal(
      answerConcept1.uuid,
      observationsHolder.findQuestionGroupObservation(singleCodedFormElement.concept, qgFormElement, 0).getValue()
    );

    let { filteredFormElements } = commonFormUtil.addNewQuestionGroup(subject, qgFormElement, observationsHolder.observations);
    assert.equal(true, _.some(filteredFormElements, x => x.uuid === textFormElement.uuid && x.questionGroupIndex === 0));
    assert.equal(true, _.some(filteredFormElements, x => x.uuid === textFormElement.uuid && x.questionGroupIndex === 1));
    assert.equal(true, _.some(filteredFormElements, x => x.uuid === singleCodedFormElement.uuid && x.questionGroupIndex === 0));
    assert.equal(true, _.some(filteredFormElements, x => x.uuid === singleCodedFormElement.uuid && x.questionGroupIndex === 1));

    filteredFormElements = commonFormUtil.removeQuestionGroup(subject, qgFormElement, observationsHolder.observations, 1)
      .filteredFormElements;
    assert.equal(true, _.some(filteredFormElements, x => x.uuid === textFormElement.uuid && x.questionGroupIndex === 0));
    assert.equal(false, _.some(filteredFormElements, x => x.uuid === textFormElement.uuid && x.questionGroupIndex === 1));

    commonFormUtil.addNewQuestionGroup(subject, qgFormElement, observationsHolder.observations);
    commonFormUtil.updateObservations(qgFormElement, "c", subject, observationsHolder, [], textFormElement, 1);
    assert.equal("b", observationsHolder.findQuestionGroupObservation(textFormElement.concept, qgFormElement, 0).getValue());
    assert.equal("c", observationsHolder.findQuestionGroupObservation(textFormElement.concept, qgFormElement, 1).getValue());

    filteredFormElements = commonFormUtil.removeQuestionGroup(subject, qgFormElement, observationsHolder.observations, 1)
      .filteredFormElements;
    assert.equal(true, _.some(filteredFormElements, x => x.uuid === textFormElement.uuid && x.questionGroupIndex === 0));
    assert.equal(false, _.some(filteredFormElements, x => x.uuid === textFormElement.uuid && x.questionGroupIndex === 1));
  });
});
