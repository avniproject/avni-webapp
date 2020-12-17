/// <reference types="Cypress" />

import { dashboardPage } from "../dashboardPage";
import { wizardPage } from "../wizardPage";
import { setupTest } from "../setup";
import { formWizardOrgPassword, formWizardOrgUsername } from "../../constants";

describe("Program Encounter Flow tests for form wizard", () => {
  beforeEach(() => {
    setupTest.login(formWizardOrgUsername, formWizardOrgPassword);
    setupTest.cleanAllOptionsFromRegistration("Test Individual");
  });
  // it("Performing new program encounter should not move to next page in case of validation error", () => {
  //   dashboardPage.performNewProgramEncounter("Program1", "ProgramEncounter1");
  //   wizardPage.typeInput("Last FE of first FEG", 123);
  //   wizardPage.assertIfPageContains("123 is invalid");
  //   wizardPage.clickNext(); //it should not go to next page because of the error.
  //   wizardPage.assertIfPageContains("First FEG");
  // });
  it("First FEG should be hidden using FEG rule", () => {
    dashboardPage.editProfile("Test Individual");
    wizardPage.clickNext();
    wizardPage.selectOption("Hide first FEG");
    wizardPage.clickNext();
    wizardPage.clickSave();
    dashboardPage.editProgramEncounter("Program1", "ProgramEncounter1");
    wizardPage.assertIfPageDoesNotContains(
      "First FEG",
      "First FE of first FEG",
      "Last FE of first FEG"
    );
    wizardPage.assertIfPageContains(
      "Second FEG",
      "First FE of Second FEG",
      "Last FE of Second FG",
      "Visit Date"
    );
    wizardPage.clickNextNTimes(2);
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPreviousNTimes(2);
    wizardPage.assertIfPageContains(
      "Second FEG",
      "First FE of Second FEG",
      "Last FE of Second FG",
      "Visit Date"
    );
    wizardPage.clickNextNTimes(2);
    wizardPage.assertIfPageContains("Summary & Recommendations");
  });
});
