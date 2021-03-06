/// <reference types="Cypress" />

import { dashboardPage } from "../../pages/dashboardPage";
import { wizardPage } from "../../pages/wizardPage";
import { setupTest } from "../../pages/setup";
import { formWizardOrgPassword, formWizardOrgUsername } from "../../constants";

describe("General Enrolment Flow tests for form wizard", () => {
  beforeEach(() => {
    setupTest.login(formWizardOrgUsername, formWizardOrgPassword);
    setupTest.cleanAllOptionsFromIndividualRegistration("Test Individual");
  });
  it("Performing new general encounter should not move to next page in case of validation error", () => {
    dashboardPage.performNewGeneralEncounter("Encounter1");
    wizardPage.typeInput("Last FE of first FEG", 123);
    wizardPage.assertIfPageContains("123 is invalid");
    wizardPage.clickNext(); //it should not go to next page because of the error.
    wizardPage.assertIfPageContains("First FEG");
  });
  it("First FEG should be hidden using FEG rule", () => {
    wizardPage.modifyIndividualRegistration("Test Individual", "Hide first FEG");
    dashboardPage.editGeneralEncounter("Encounter1");
    wizardPage.checkScenarioHideFirstFEG();
  });
  it("First FEG should be hidden using all FE rule", () => {
    wizardPage.modifyIndividualRegistration(
      "Test Individual",
      "Hide first FE of first FEG",
      "Hide last FE of first FEG"
    );
    dashboardPage.editGeneralEncounter("Encounter1");
    wizardPage.checkScenarioHideFirstFEGbyAllFEG();
  });
  it("First FE should be hidden in first FEG", () => {
    wizardPage.modifyIndividualRegistration("Test Individual", "Hide first FE of first FEG");
    dashboardPage.editGeneralEncounter("Encounter1");
    wizardPage.checkScenarioHideFirstFEofFirstFEG();
  });
  it("Last FE should be hidden in first FEG", () => {
    wizardPage.modifyIndividualRegistration("Test Individual", "Hide last FE of first FEG");
    dashboardPage.editGeneralEncounter("Encounter1");
    wizardPage.checkScenarioHideLastFEofFirstFEG();
  });
  it("Second FEG is hidden using FEG rule", () => {
    wizardPage.modifyIndividualRegistration("Test Individual", "Hide second FEG");
    dashboardPage.editGeneralEncounter("Encounter1");
    wizardPage.checkScenarioHideSecondFEG();
  });
  it("Second FEG is hidden using all FE rule", () => {
    wizardPage.modifyIndividualRegistration(
      "Test Individual",
      "Hide first FE of second FEG",
      "Hide last FE of second FEG"
    );
    dashboardPage.editGeneralEncounter("Encounter1");
    wizardPage.checkScenarioHideSecondFEGbyAllFEG();
  });
  it("First FE in second FEG is hidden", () => {
    wizardPage.modifyIndividualRegistration("Test Individual", "Hide first FE of second FEG");
    dashboardPage.editGeneralEncounter("Encounter1");
    wizardPage.checkScenarioHideFirstFEofSecondFEG();
  });
  it("Last FE in second FEG is hidden", () => {
    wizardPage.modifyIndividualRegistration("Test Individual", "Hide last FE of second FEG");
    dashboardPage.editGeneralEncounter("Encounter1");
    wizardPage.checkScenarioHideLastFEofSecondFEG();
  });
  it("Last FEG should be hidden using FEG rule", () => {
    wizardPage.modifyIndividualRegistration("Test Individual", "Hide last FEG");
    dashboardPage.editGeneralEncounter("Encounter1");
    wizardPage.checkScenarioHideLastFEG();
  });
  it("Last FEG is hidden using all FE rule", () => {
    wizardPage.modifyIndividualRegistration(
      "Test Individual",
      "Hide first FE of last FEG",
      "Hide last FE of last FEG"
    );
    dashboardPage.editGeneralEncounter("Encounter1");
    wizardPage.checkScenarioHideLastFEGbyAllFEG();
  });
  it("First FE in last FEG is hidden", () => {
    wizardPage.modifyIndividualRegistration("Test Individual", "Hide first FE of last FEG");
    dashboardPage.editGeneralEncounter("Encounter1");
    wizardPage.checkScenarioHideFirstFEofLastFEG();
  });
  it("Last FE in last FEG is hidden", () => {
    wizardPage.modifyIndividualRegistration("Test Individual", "Hide last FE of last FEG");
    dashboardPage.editGeneralEncounter("Encounter1");
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
    dashboardPage.editGeneralEncounter("Encounter1");
    wizardPage.assertIfPageContains("Visit Date");
    wizardPage.checkScenarioHideAllFEG();
  });
  it("An Empty encounter without any FEG created", () => {
    dashboardPage.performNewGeneralEncounter("Empty Encounter");
    wizardPage.assertIfPageContains("Visit Date");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
  });
  it("Another FEG in same form is hidden by skip logic in current form", () => {
    dashboardPage.editGeneralEncounter("Encounter1");
    wizardPage.checkScenarioFEGhiddeninSameForm();
  });
  it("FE in same group in same form is hidden", () => {
    dashboardPage.editGeneralEncounter("Encounter1");
    wizardPage.checkScenarioFEhiddeninSameFEG();
  });
  it("FE in another group in same form is hidden", () => {
    dashboardPage.editGeneralEncounter("Encounter1");
    wizardPage.checkScenarioHideFEinAnotherFEGInSameForm();
  });
  it("Performing new encounter should not move to next page in case of validation error in visit date(static element)", () => {
    dashboardPage.editGeneralEncounter("Encounter1");
    wizardPage.enterDate("Visit Date", "11/01/2050");
    wizardPage.assertIfPageContains("Encounter date cannot be in future");
    wizardPage.clickNext(); //it should not go to next page because of the error.
    wizardPage.assertIfPageContains("First FEG");
  });
});
