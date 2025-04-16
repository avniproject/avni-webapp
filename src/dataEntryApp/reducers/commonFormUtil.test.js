import commonFormUtil from "./commonFormUtil";
import { Concept, ObservationsHolder, StaticFormElementGroup } from "openchs-models";
import EntityFactory from "../test/EntityFactory";
import { assert } from "chai";
import TestKeyValueFactory from "../test/TestKeyValueFactory";
import _ from "lodash";
import Wizard from "../state/Wizard";

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

    filteredFormElements = commonFormUtil.removeQuestionGroup(subject, qgFormElement, observationsHolder.observations, [], 1)
      .filteredFormElements;
    assert.equal(true, _.some(filteredFormElements, x => x.uuid === textFormElement.uuid && x.questionGroupIndex === 0));
    assert.equal(false, _.some(filteredFormElements, x => x.uuid === textFormElement.uuid && x.questionGroupIndex === 1));

    commonFormUtil.addNewQuestionGroup(subject, qgFormElement, observationsHolder.observations);
    commonFormUtil.updateObservations(qgFormElement, "c", subject, observationsHolder, [], textFormElement, 1);
    assert.equal("b", observationsHolder.findQuestionGroupObservation(textFormElement.concept, qgFormElement, 0).getValue());
    assert.equal("c", observationsHolder.findQuestionGroupObservation(textFormElement.concept, qgFormElement, 1).getValue());

    filteredFormElements = commonFormUtil.removeQuestionGroup(subject, qgFormElement, observationsHolder.observations, [], 1)
      .filteredFormElements;
    assert.equal(true, _.some(filteredFormElements, x => x.uuid === textFormElement.uuid && x.questionGroupIndex === 0));
    assert.equal(false, _.some(filteredFormElements, x => x.uuid === textFormElement.uuid && x.questionGroupIndex === 1));

    // After removing the question group at index 1, we should only have the observation at index 0
    assert.equal("b", observationsHolder.findQuestionGroupObservation(textFormElement.concept, qgFormElement, 0).getValue());
    // We should not try to access the removed question group's observations
    assert.isFalse(observationsHolder.findQuestionGroupObservation(textFormElement.concept, qgFormElement, 1));
  });
});

describe("Form Navigation Tests", () => {
  let form;
  let formElementGroup1;
  let formElementGroup2;
  let formElementGroup3;
  let textFormElement1;
  let textFormElement2;
  let textFormElement3;
  let subject;
  let observationsHolder;
  let textConcept1;
  let textConcept2;
  let textConcept3;

  beforeEach(() => {
    // Create a form with multiple form element groups
    form = EntityFactory.createForm2({ uuid: "form-nav-1" });

    // Create form element groups with different display orders
    formElementGroup1 = EntityFactory.createFormElementGroup2({
      uuid: "feg-nav-1",
      form: form,
      displayOrder: 1
    });

    formElementGroup2 = EntityFactory.createFormElementGroup2({
      uuid: "feg-nav-2",
      form: form,
      displayOrder: 2
    });

    formElementGroup3 = EntityFactory.createFormElementGroup2({
      uuid: "feg-nav-3",
      form: form,
      displayOrder: 3
    });

    // Add form element groups to form
    form.addFormElementGroup(formElementGroup1);
    form.addFormElementGroup(formElementGroup2);
    form.addFormElementGroup(formElementGroup3);

    // Set up the next/previous relationships between form element groups
    formElementGroup1.next = () => formElementGroup2;
    formElementGroup1.previous = () => null;

    formElementGroup2.next = () => formElementGroup3;
    formElementGroup2.previous = () => formElementGroup1;

    formElementGroup3.next = () => null; // This is crucial - last group returns null for next
    formElementGroup3.previous = () => formElementGroup2;

    // Create concepts for form elements
    textConcept1 = EntityFactory.createConcept2({
      uuid: "c-nav-1",
      name: "c-nav-1",
      dataType: Concept.dataType.Text
    });

    textConcept2 = EntityFactory.createConcept2({
      uuid: "c-nav-2",
      name: "c-nav-2",
      dataType: Concept.dataType.Text
    });

    textConcept3 = EntityFactory.createConcept2({
      uuid: "c-nav-3",
      name: "c-nav-3",
      dataType: Concept.dataType.Text
    });

    // Create form elements
    textFormElement1 = EntityFactory.createFormElement2({
      uuid: "fe-nav-1",
      formElementGroup: formElementGroup1,
      concept: textConcept1,
      displayOrder: 1,
      mandatory: true
    });

    textFormElement2 = EntityFactory.createFormElement2({
      uuid: "fe-nav-2",
      formElementGroup: formElementGroup2,
      concept: textConcept2,
      displayOrder: 1,
      mandatory: true
    });

    textFormElement3 = EntityFactory.createFormElement2({
      uuid: "fe-nav-3",
      formElementGroup: formElementGroup3,
      concept: textConcept3,
      displayOrder: 1,
      mandatory: true
    });

    // Add form elements to form element groups
    formElementGroup1.addFormElement(textFormElement1);
    formElementGroup2.addFormElement(textFormElement2);
    formElementGroup3.addFormElement(textFormElement3);

    // Create subject and observations holder
    subject = EntityFactory.createSubject({});
    observationsHolder = new ObservationsHolder(subject.observations);

    // Initialize observations with values to prevent validation errors
    commonFormUtil.updateObservations(textFormElement1, "test value 1", subject, observationsHolder, []);
    commonFormUtil.updateObservations(textFormElement2, "test value 2", subject, observationsHolder, []);
    commonFormUtil.updateObservations(textFormElement3, "test value 3", subject, observationsHolder, []);

    // Update the subject's observations
    subject.observations = observationsHolder.observations;
  });

  it("should load the first form element group on onLoad", function() {
    const result = commonFormUtil.onLoad(form, subject);

    assert.equal(result.formElementGroup.uuid, formElementGroup1.uuid);
    assert.isArray(result.filteredFormElements);
    assert.isFalse(result.onSummaryPage);
    assert.instanceOf(result.wizard, Wizard);
    assert.equal(result.wizard.currentPage, 1);
    assert.isUndefined(result.isFormEmpty);
  });

  it("should load a static form element group when no visible elements exist", function() {
    // Create a form with no visible elements
    const emptyForm = EntityFactory.createForm2({ uuid: "empty-form" });
    const result = commonFormUtil.onLoad(emptyForm, subject);

    assert.instanceOf(result.formElementGroup, StaticFormElementGroup);
    assert.isArray(result.filteredFormElements);
    assert.equal(result.filteredFormElements.length, 0);
    assert.isFalse(result.onSummaryPage);
    assert.instanceOf(result.wizard, Wizard);
    assert.equal(result.wizard.currentPage, 1);
    assert.isTrue(result.isFormEmpty);
  });

  it("should load the next form element group for individual registration", function() {
    // Create a form with a static first group
    const individualForm = EntityFactory.createForm2({ uuid: "individual-form" });
    const feg = EntityFactory.createFormElementGroup2({
      uuid: "individual-feg",
      form: individualForm,
      displayOrder: 1
    });
    individualForm.addFormElementGroup(feg);

    const result = commonFormUtil.onLoad(individualForm, subject, true);

    // Should skip the static group and move to the next group
    assert.equal(result.formElementGroup.uuid, feg.uuid);
    assert.isFalse(result.onSummaryPage);
  });

  it("should navigate to the next form element group with onNext", function() {
    // Start with the first form element group
    const initialState = {
      formElementGroup: formElementGroup1,
      observations: subject.observations,
      entity: subject,
      filteredFormElements: [textFormElement1],
      validationResults: [],
      wizard: new Wizard(3, 1, 1),
      entityValidations: []
    };

    // Save the original wizard page
    const originalPage = initialState.wizard.currentPage;

    const result = commonFormUtil.onNext(initialState);

    // Verify the result has the correct form element group
    assert.equal(result.formElementGroup.uuid, formElementGroup2.uuid);
    assert.isArray(result.filteredFormElements);
    assert.isFalse(result.onSummaryPage);

    // Verify the wizard in the result has been updated
    assert.instanceOf(result.wizard, Wizard);
    assert.equal(initialState.wizard.currentPage, originalPage + 1);
  });

  it("should navigate to the previous form element group with onPrevious", function() {
    // Start with the second form element group
    const initialState = {
      formElementGroup: formElementGroup2,
      observations: subject.observations,
      entity: subject,
      filteredFormElements: [textFormElement2],
      validationResults: [],
      wizard: new Wizard(3, 1, 2),
      onSummaryPage: false
    };

    // Save the original wizard page
    const originalPage = initialState.wizard.currentPage;

    const result = commonFormUtil.onPrevious(initialState);

    // Verify the result has the correct form element group
    assert.equal(result.formElementGroup.uuid, formElementGroup1.uuid);
    assert.isArray(result.filteredFormElements);
    assert.isFalse(result.onSummaryPage);

    // Verify the wizard in the result is a new instance with updated page
    assert.instanceOf(result.wizard, Wizard);
    assert.equal(result.wizard.currentPage, originalPage - 1);
  });

  it("should handle validation errors and not proceed to next group", function() {
    // Create a clean subject without observations for this test
    const emptySubject = EntityFactory.createSubject({});
    const emptyObservationsHolder = new ObservationsHolder(emptySubject.observations);

    // Create a validation result with error
    const validationResult = {
      success: false,
      formIdentifier: textFormElement1.uuid,
      messageKey: "REQUIRED_FIELD"
    };

    // Start with the first form element group with validation error
    const initialState = {
      formElementGroup: formElementGroup1,
      observations: emptySubject.observations,
      entity: emptySubject,
      filteredFormElements: [textFormElement1],
      validationResults: [validationResult],
      wizard: new Wizard(3, 1, 1),
      entityValidations: []
    };

    const result = commonFormUtil.onNext(initialState);

    // Should stay on the same group due to validation error
    assert.equal(result.formElementGroup.uuid, formElementGroup1.uuid);
    assert.isArray(result.filteredFormElements);
    assert.isFalse(result.onSummaryPage);
    assert.instanceOf(result.wizard, Wizard);
    assert.equal(result.wizard.currentPage, 1);
    assert.isArray(result.validationResults);
    assert.equal(result.validationResults.length, 1);
  });

  it("should navigate to summary page after last form element group", function() {
    // Start with the last form element group
    const initialState = {
      formElementGroup: formElementGroup3,
      observations: subject.observations,
      entity: subject,
      filteredFormElements: [textFormElement3],
      validationResults: [],
      wizard: new Wizard(3, 1, 3),
      entityValidations: [],
      onSummaryPage: false
    };

    // Verify that formElementGroup3.next() returns null
    assert.isNull(formElementGroup3.next());

    const result = commonFormUtil.onNext(initialState);

    // Should move to summary page
    assert.isTrue(result.onSummaryPage);
    assert.instanceOf(result.wizard, Wizard);
    // The wizard page doesn't change when moving to summary page
    // since we're already at the last page (3)
    assert.equal(result.wizard.currentPage, 3);
  });

  it("should navigate from summary page to last form element group with onPrevious", function() {
    // Start on the summary page
    const initialState = {
      formElementGroup: formElementGroup3,
      observations: subject.observations,
      entity: subject,
      filteredFormElements: [textFormElement3],
      validationResults: [],
      wizard: new Wizard(3, 1, 3),
      onSummaryPage: true
    };

    const result = commonFormUtil.onPrevious(initialState);

    // Should move back to the last form element group
    assert.equal(result.formElementGroup.uuid, formElementGroup3.uuid);
    assert.isArray(result.filteredFormElements);
    assert.isFalse(result.onSummaryPage);
    assert.instanceOf(result.wizard, Wizard);
    // The wizard page doesn't change when moving from summary page back to the last form
    assert.equal(result.wizard.currentPage, 3);
  });
});

describe("Form Element Filtering Tests", () => {
  let form;
  let formElementGroup;
  let textFormElement;
  let numericFormElement;
  let codedFormElement;
  let hiddenFormElement;
  let subject;
  let observationsHolder;
  let textConcept;
  let numericConcept;
  let codedConcept;
  let hiddenConcept;
  let answerConcept1;
  let answerConcept2;

  beforeEach(() => {
    // Create a form with a form element group
    form = EntityFactory.createForm2({ uuid: "form-filter-1" });

    formElementGroup = EntityFactory.createFormElementGroup2({
      uuid: "feg-filter-1",
      form: form,
      displayOrder: 1
    });

    form.addFormElementGroup(formElementGroup);

    // Create concepts for form elements
    textConcept = EntityFactory.createConcept2({
      uuid: "c-filter-text",
      name: "c-filter-text",
      dataType: Concept.dataType.Text
    });

    numericConcept = EntityFactory.createConcept2({
      uuid: "c-filter-numeric",
      name: "c-filter-numeric",
      dataType: Concept.dataType.Numeric
    });

    answerConcept1 = EntityFactory.createConcept2({
      uuid: "ac-filter-1",
      name: "ac-filter-1",
      dataType: Concept.dataType.NA
    });

    answerConcept2 = EntityFactory.createConcept2({
      uuid: "ac-filter-2",
      name: "ac-filter-2",
      dataType: Concept.dataType.NA
    });

    codedConcept = EntityFactory.createConcept2({
      uuid: "c-filter-coded",
      name: "c-filter-coded",
      dataType: Concept.dataType.Coded,
      answers: [answerConcept1, answerConcept2]
    });

    hiddenConcept = EntityFactory.createConcept2({
      uuid: "c-filter-hidden",
      name: "c-filter-hidden",
      dataType: Concept.dataType.Text
    });

    // Create form elements
    textFormElement = EntityFactory.createFormElement2({
      uuid: "fe-filter-text",
      formElementGroup: formElementGroup,
      concept: textConcept,
      displayOrder: 1,
      mandatory: true
    });

    numericFormElement = EntityFactory.createFormElement2({
      uuid: "fe-filter-numeric",
      formElementGroup: formElementGroup,
      concept: numericConcept,
      displayOrder: 2,
      mandatory: false
    });

    codedFormElement = EntityFactory.createFormElement2({
      uuid: "fe-filter-coded",
      formElementGroup: formElementGroup,
      concept: codedConcept,
      displayOrder: 3,
      mandatory: false
    });

    hiddenFormElement = EntityFactory.createFormElement2({
      uuid: "fe-filter-hidden",
      formElementGroup: formElementGroup,
      concept: hiddenConcept,
      displayOrder: 4,
      mandatory: false
    });

    // Add form elements to form element group
    formElementGroup.addFormElement(textFormElement);
    formElementGroup.addFormElement(numericFormElement);
    formElementGroup.addFormElement(codedFormElement);
    formElementGroup.addFormElement(hiddenFormElement);

    // Create subject and observations holder
    subject = EntityFactory.createSubject({});
    observationsHolder = new ObservationsHolder(subject.observations);

    // Initialize observations with values
    commonFormUtil.updateObservations(textFormElement, "test text", subject, observationsHolder, []);
    commonFormUtil.updateObservations(numericFormElement, 42, subject, observationsHolder, []);
    commonFormUtil.updateObservations(codedFormElement, answerConcept1.uuid, subject, observationsHolder, []);

    // Update the subject's observations
    subject.observations = observationsHolder.observations;
  });

  it("should update observations and handle validation", function() {
    // Start with empty validation results
    const initialValidationResults = [];

    // Update an observation
    const result = commonFormUtil.updateObservations(
      textFormElement,
      "updated text value",
      subject,
      observationsHolder,
      initialValidationResults
    );

    // Verify the function returns the expected structure
    assert.isObject(result);
    assert.property(result, "filteredFormElements");
    assert.property(result, "validationResults");
    assert.isArray(result.filteredFormElements);
    assert.isArray(result.validationResults);
  });

  it("should handle validation results correctly", function() {
    // Create validation results
    const existingValidationResults = [
      {
        formIdentifier: textFormElement.uuid,
        success: false,
        messageKey: "REQUIRED_FIELD"
      },
      {
        formIdentifier: numericFormElement.uuid,
        success: true
      }
    ];

    // Create new validation results
    const newValidationResults = [
      {
        formIdentifier: textFormElement.uuid,
        success: true
      },
      {
        formIdentifier: codedFormElement.uuid,
        success: false,
        messageKey: "INVALID_CODED_VALUE"
      }
    ];

    // Handle the validation results
    const updatedValidationResults = commonFormUtil.handleValidationResult(newValidationResults, existingValidationResults);

    // Verify that the validation results were properly merged
    // The result should contain:
    // 1. No entry for textFormElement (now successful)
    // 2. An entry for codedFormElement (failed)
    // 3. An entry for numericFormElement (existing successful validation is preserved)

    // Check if codedFormElement's validation is included
    const codedValidation = updatedValidationResults.find(vr => vr.formIdentifier === codedFormElement.uuid);
    assert.isDefined(codedValidation, "Should include validation for codedFormElement");
    assert.equal(codedValidation.messageKey, "INVALID_CODED_VALUE");
    assert.isFalse(codedValidation.success);

    // Verify that the now-successful validation was removed
    assert.isFalse(
      updatedValidationResults.some(vr => vr.formIdentifier === textFormElement.uuid),
      "Text form element should be removed as it's now successful"
    );

    // Verify that the existing successful validation is preserved
    // The function only removes validations for elements that are in newValidationResults
    const numericValidation = updatedValidationResults.find(vr => vr.formIdentifier === numericFormElement.uuid);
    assert.isDefined(numericValidation, "Should preserve existing validation for numericFormElement");
    assert.isTrue(numericValidation.success);
  });

  it("should preserve existing validation failures not present in new results", function() {
    // Create existing validation results with failures for multiple elements
    const existingValidationResults = [
      {
        formIdentifier: textFormElement.uuid,
        success: false,
        messageKey: "REQUIRED_FIELD"
      },
      {
        formIdentifier: numericFormElement.uuid,
        success: false,
        messageKey: "INVALID_NUMERIC"
      },
      {
        formIdentifier: hiddenFormElement.uuid,
        success: true
      }
    ];

    // Create new validation results that only address some of the elements
    const newValidationResults = [
      {
        formIdentifier: textFormElement.uuid,
        success: true // This one becomes successful
      }
      // Note: No results for numericFormElement or hiddenFormElement
    ];

    // Handle the validation results
    const updatedValidationResults = commonFormUtil.handleValidationResult(newValidationResults, existingValidationResults);

    // Verify that the validation results were properly merged
    // The result should:
    // 1. Remove textFormElement (now successful)
    // 2. Preserve numericFormElement (still failed, not in new results)
    // 3. Preserve hiddenFormElement (was successful, not in new results)

    // Verify that the fixed validation was removed
    assert.isFalse(
      updatedValidationResults.some(vr => vr.formIdentifier === textFormElement.uuid),
      "Text form element should be removed as it's now successful"
    );

    // Verify that the existing failed validation is preserved
    const numericValidation = updatedValidationResults.find(vr => vr.formIdentifier === numericFormElement.uuid);
    assert.isDefined(numericValidation, "Should preserve existing validation for numericFormElement");
    assert.equal(numericValidation.messageKey, "INVALID_NUMERIC");
    assert.isFalse(numericValidation.success);

    // Verify that the existing successful validation is preserved
    const hiddenValidation = updatedValidationResults.find(vr => vr.formIdentifier === hiddenFormElement.uuid);
    assert.isDefined(hiddenValidation, "Should preserve existing validation for hiddenFormElement");
    assert.isTrue(hiddenValidation.success);
  });

  it("should get validation result for a specific form element", function() {
    // Create validation results
    const validationResults = [
      {
        formIdentifier: textFormElement.uuid,
        success: false,
        messageKey: "REQUIRED_FIELD"
      },
      {
        formIdentifier: numericFormElement.uuid,
        success: true
      }
    ];

    // Get validation result for text form element
    const textValidationResult = commonFormUtil.getValidationResult(validationResults, textFormElement.uuid);

    // Verify the validation result
    assert.equal(textValidationResult.formIdentifier, textFormElement.uuid);
    assert.equal(textValidationResult.messageKey, "REQUIRED_FIELD");
    assert.isFalse(textValidationResult.success);

    // Get validation result for coded form element (should be undefined)
    const codedValidationResult = commonFormUtil.getValidationResult(validationResults, codedFormElement.uuid);

    // Verify the validation result
    assert.isUndefined(codedValidationResult);
  });

  it("should validate form element data", function() {
    // Create a form element with mandatory flag
    const mandatoryFormElement = EntityFactory.createFormElement2({
      uuid: "fe-filter-mandatory",
      formElementGroup: formElementGroup,
      concept: textConcept,
      displayOrder: 5,
      mandatory: true
    });

    // Create an observations holder with no value for the mandatory field
    const emptyObsHolder = new ObservationsHolder([]);

    // Get validation errors
    const validationErrors = commonFormUtil.getFEDataValidationErrors([mandatoryFormElement], emptyObsHolder);

    // Verify that validation errors include the mandatory field error
    assert.isArray(validationErrors);
    const mandatoryError = validationErrors.find(ve => ve.formIdentifier === mandatoryFormElement.uuid);
    assert.isDefined(mandatoryError);
    assert.isFalse(mandatoryError.success);
  });
});
