/// <reference types="Cypress" />

import { dashboardPage } from "../pages/dashboardPage";
import { wizardPage } from "../pages/wizardPage";
import { setupTest } from "../setup";
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
    //wizardPage.checkScenarioHideFirstFEG();
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
});
