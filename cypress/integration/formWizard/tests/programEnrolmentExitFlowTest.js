/// <reference types="Cypress" />

import { dashboardPage } from "../pages/dashboardPage";
import { wizardPage } from "../pages/wizardPage";
import { setupTest } from "../setup";
import { formWizardOrgPassword, formWizardOrgUsername } from "../../constants";

describe("Program Enrolment Exit Flow tests for form wizard", () => {
  beforeEach(() => {
    setupTest.login(formWizardOrgUsername, formWizardOrgPassword);
    setupTest.cleanAllOptionsFromIndividualRegistration("Test Individual");
  });
  it("Exit program should not move to next page in case of validation error", () => {
    dashboardPage.exitProgram("Program1");
    wizardPage.typeInput("Last FE of first FEG", 123);
    wizardPage.assertIfPageContains("123 is invalid");
    wizardPage.clickNext(); //it should not go to next page because of the error.
    wizardPage.assertIfPageContains("First FEG");
  });
  it("First FEG should be hidden using FEG rule", () => {
    wizardPage.modifyIndividualRegistration("Test Individual", "Hide first FEG");
    dashboardPage.exitProgram("Program1");
    wizardPage.checkScenarioHideFirstFEG();
  });
  it("First FEG should be hidden using all FE rule", () => {
    wizardPage.modifyIndividualRegistration(
      "Test Individual",
      "Hide first FE of first FEG",
      "Hide last FE of first FEG"
    );
    dashboardPage.exitProgram("Program1");
    wizardPage.checkScenarioHideFirstFEGbyAllFEG();
  });
  it("First FE should be hidden in first FEG", () => {
    wizardPage.modifyIndividualRegistration("Test Individual", "Hide first FE of first FEG");
    dashboardPage.exitProgram("Program1");
    wizardPage.checkScenarioHideFirstFEofFirstFEG();
  });
  it("Last FE should be hidden in first FEG", () => {
    wizardPage.modifyIndividualRegistration("Test Individual", "Hide last FE of first FEG");
    dashboardPage.exitProgram("Program1");
    wizardPage.checkScenarioHideLastFEofFirstFEG();
  });
  it("Second FEG is hidden using FEG rule", () => {
    wizardPage.modifyIndividualRegistration("Test Individual", "Hide second FEG");
    dashboardPage.exitProgram("Program1");
    wizardPage.checkScenarioHideSecondFEG();
  });
  it("Second FEG is hidden using all FE rule", () => {
    wizardPage.modifyIndividualRegistration(
      "Test Individual",
      "Hide first FE of second FEG",
      "Hide last FE of second FEG"
    );
    dashboardPage.exitProgram("Program1");
    wizardPage.checkScenarioHideSecondFEGbyAllFEG();
  });
  it("First FE in second FEG is hidden", () => {
    wizardPage.modifyIndividualRegistration("Test Individual", "Hide first FE of second FEG");
    dashboardPage.exitProgram("Program1");
    wizardPage.checkScenarioHideFirstFEofSecondFEG();
  });
  it("Last FE in second FEG is hidden", () => {
    wizardPage.modifyIndividualRegistration("Test Individual", "Hide last FE of second FEG");
    dashboardPage.exitProgram("Program1");
    wizardPage.checkScenarioHideLastFEofSecondFEG();
  });
  it("Last FEG should be hidden using FEG rule", () => {
    wizardPage.modifyIndividualRegistration("Test Individual", "Hide last FEG");
    dashboardPage.exitProgram("Program1");
    wizardPage.checkScenarioHideLastFEG();
  });
  it("Last FEG is hidden using all FE rule", () => {
    wizardPage.modifyIndividualRegistration(
      "Test Individual",
      "Hide first FE of last FEG",
      "Hide last FE of last FEG"
    );
    dashboardPage.exitProgram("Program1");
    wizardPage.checkScenarioHideLastFEGbyAllFEG();
  });
  it("First FE in last FEG is hidden", () => {
    wizardPage.modifyIndividualRegistration("Test Individual", "Hide first FE of last FEG");
    dashboardPage.exitProgram("Program1");
    wizardPage.checkScenarioHideFirstFEofLastFEG();
  });
  it("Last FE in last FEG is hidden", () => {
    wizardPage.modifyIndividualRegistration("Test Individual", "Hide last FE of last FEG");
    dashboardPage.exitProgram("Program1");
    wizardPage.checkScenarioHideLastFEofLastFEG();
  });
  it("All the FE in the form are hidden", () => {
    wizardPage.modifyIndividualRegistration(
      "Test Individual",
      "Hide first FE of first FEG",
      "Hide last FE of last FEG",
      "Hide last FE of first FEG",
      "Hide first FE of second FEG",
      "Hide last FE of second FEG",
      "Hide first FE of last FEG"
    );
    dashboardPage.exitProgram("Program1");
    wizardPage.assertIfPageContains("Exit Enrolment Date");
    wizardPage.checkScenarioHideAllFEG();
  });
  it("An Empty encounter without any FEG created", () => {
    dashboardPage.exitProgram("EmptyProgram");
    wizardPage.assertIfPageContains("Exit Enrolment Date");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
  });
  it("Another FEG in same form is hidden by skip logic in current form", () => {
    dashboardPage.exitProgram("Program1");
    wizardPage.checkScenarioFEGhiddeninSameForm();
  });
  it("FE in same group in same form is hidden", () => {
    dashboardPage.exitProgram("Program1");
    wizardPage.checkScenarioFEhiddeninSameFEG();
  });
  it("FE in another group in same form is hidden", () => {
    dashboardPage.exitProgram("Program1");
    wizardPage.checkScenarioHideFEinAnotherFEGInSameForm();
  });
  it("Exit form should not move to next page in case of validation error in Exit enrolment date(static element)", () => {
    dashboardPage.exitProgram("Program1");
    wizardPage.enterDate("Exit Enrolment Date", "11/01/2021");
    wizardPage.assertIfPageContains("Exit date cannot be in future");
    wizardPage.clickNext(); //it should not go to next page because of the error.
    wizardPage.assertIfPageContains("First FEG");
  });
});
