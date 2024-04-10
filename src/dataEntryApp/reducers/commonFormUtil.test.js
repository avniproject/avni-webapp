import commonFormUtil from "./commonFormUtil";
import { Concept, ObservationsHolder } from "openchs-models";
import EntityFactory from "../test/EntityFactory";
import { assert } from "chai";
import TestKeyValueFactory from "../test/TestKeyValueFactory";
import _ from "lodash";

describe("question group and repeatable question groups", () => {
  let qgFormElement;
  let formElement;

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

    qgFormElement = EntityFactory.createFormElement2({
      uuid: "qg-fe-1",
      formElementGroup: feg,
      concept: qgConcept
    });
    formElement = EntityFactory.createFormElement2({
      uuid: "fe-1",
      formElementGroup: feg,
      concept: textConcept,
      group: qgFormElement
    });
  });

  it("should create and update question group obs", function() {
    const subject = EntityFactory.createSubject({});
    const observationsHolder = new ObservationsHolder(subject.observations);
    commonFormUtil.updateObservations(qgFormElement, "a", subject, observationsHolder, [], formElement, null);
    assert.equal("a", observationsHolder.findQuestionGroupObservation(formElement.concept, qgFormElement).getValue());
    commonFormUtil.updateObservations(qgFormElement, "b", subject, observationsHolder, [], formElement, null);
    assert.equal("b", observationsHolder.findQuestionGroupObservation(formElement.concept, qgFormElement).getValue());
  });

  it("should create and update repeatable question group obs", function() {
    const keyValue = TestKeyValueFactory.create({ key: "repeatable", value: true });
    qgFormElement.keyValues = [keyValue];
    const subject = EntityFactory.createSubject({});
    const observationsHolder = new ObservationsHolder(subject.observations);
    commonFormUtil.updateObservations(qgFormElement, "a", subject, observationsHolder, [], formElement, 0);
    assert.equal("a", observationsHolder.findQuestionGroupObservation(formElement.concept, qgFormElement, 0).getValue());
    commonFormUtil.updateObservations(qgFormElement, "b", subject, observationsHolder, [], formElement, 0);
    assert.equal("b", observationsHolder.findQuestionGroupObservation(formElement.concept, qgFormElement, 0).getValue());

    let { filteredFormElements } = commonFormUtil.addNewQuestionGroup(subject, qgFormElement, observationsHolder.observations);
    assert.equal(true, _.some(filteredFormElements, x => x.uuid === formElement.uuid && x.questionGroupIndex === 0));
    assert.equal(true, _.some(filteredFormElements, x => x.uuid === formElement.uuid && x.questionGroupIndex === 1));

    filteredFormElements = commonFormUtil.removeQuestionGroup(subject, qgFormElement, observationsHolder.observations, 1)
      .filteredFormElements;
    assert.equal(true, _.some(filteredFormElements, x => x.uuid === formElement.uuid && x.questionGroupIndex === 0));
    assert.equal(false, _.some(filteredFormElements, x => x.uuid === formElement.uuid && x.questionGroupIndex === 1));

    commonFormUtil.addNewQuestionGroup(subject, qgFormElement, observationsHolder.observations);
    commonFormUtil.updateObservations(qgFormElement, "c", subject, observationsHolder, [], formElement, 1);
    assert.equal("b", observationsHolder.findQuestionGroupObservation(formElement.concept, qgFormElement, 0).getValue());
    assert.equal("c", observationsHolder.findQuestionGroupObservation(formElement.concept, qgFormElement, 1).getValue());

    filteredFormElements = commonFormUtil.removeQuestionGroup(subject, qgFormElement, observationsHolder.observations, 1)
      .filteredFormElements;
    assert.equal(true, _.some(filteredFormElements, x => x.uuid === formElement.uuid && x.questionGroupIndex === 0));
    assert.equal(false, _.some(filteredFormElements, x => x.uuid === formElement.uuid && x.questionGroupIndex === 1));
  });
});
