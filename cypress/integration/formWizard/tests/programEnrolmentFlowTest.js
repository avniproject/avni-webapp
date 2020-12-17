/// <reference types="Cypress" />

import { dashboardPage } from "../dashboardPage";
import { wizardPage } from "../wizardPage";
import { setupTest } from "../setup";
import { formWizardOrgPassword, formWizardOrgUsername } from "../../constants";

describe("Program Enrolment Flow tests for form wizard", () => {
  beforeEach(() => {
    setupTest.login(formWizardOrgUsername, formWizardOrgPassword);
    setupTest.cleanAllOptionsFromRegistration("Test Individual");
  });
  it("Enrolment page should give validation error and should not move to next page", () => {
    dashboardPage.openDashboard("Test Individual");
    dashboardPage.editProgramEnrolment("Program1");
    wizardPage.typeInput("Last FE of first FEG", 123);
    wizardPage.assertIfPageContains("123 is invalid");
    wizardPage.clickNext(); //it should not go to next page because of the error.
    wizardPage.assertIfPageContains("First FEG");
  });
  it("First FEG should be hidden by FEG rule", () => {
    dashboardPage.editProfile("Test Individual");
    wizardPage.clickNext();
    wizardPage.selectOption("Hide first FEG");
    wizardPage.clickNext();
    wizardPage.clickSave();
    dashboardPage.editProgramEnrolment("Program1");
    wizardPage.assertIfPageDoesNotContains(
      "First FEG",
      "First FE of first FEG",
      "Last FE of first FEG"
    );
    wizardPage.assertIfPageContains(
      "Second FEG",
      "Enrolment Date",
      "First FE of second FEG",
      "Last FE of second FEG"
    );
    wizardPage.clickNextNTimes(2);
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPreviousNTimes(2);
    wizardPage.assertIfPageContains(
      "Second FEG",
      "Enrolment Date",
      "First FE of second FEG",
      "Last FE of second FEG"
    );
    wizardPage.clickNextNTimes(2);
    wizardPage.assertIfPageContains("Summary & Recommendations");
  });
  it("First FEG should be hidden by all FE rule", () => {
    dashboardPage.editProfile("Test Individual");
    wizardPage.clickNext();
    wizardPage.selectOptions("Hide first FE of first FEG", "Hide last FE of first FEG");
    wizardPage.clickNext();
    wizardPage.clickSave();
    dashboardPage.editProgramEnrolment("Program1");
    wizardPage.assertIfPageDoesNotContains(
      "First FEG",
      "First FE of first FEG",
      "Last FE of first FEG"
    );
    wizardPage.assertIfPageContains(
      "Second FEG",
      "Enrolment Date",
      "First FE of second FEG",
      "Last FE of second FEG"
    );
    wizardPage.clickNextNTimes(2);
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPreviousNTimes(2);
    wizardPage.assertIfPageContains(
      "Second FEG",
      "Enrolment Date",
      "First FE of second FEG",
      "Last FE of second FEG"
    );
    wizardPage.clickNextNTimes(2);
    wizardPage.assertIfPageContains("Summary & Recommendations");
  });
  it("First FEG should be hidden by all FE rule", () => {
    dashboardPage.editProfile("Test Individual");
    wizardPage.clickNext();
    wizardPage.selectOption("Hide first FE of first FEG");
    wizardPage.clickNext();
    wizardPage.clickSave();
    dashboardPage.editProgramEnrolment("Program1");
    wizardPage.assertIfPageContains("Enrolment Date", "First FEG", "Last FE of first FEG");
    wizardPage.assertIfPageDoesNotContains("First FE of first FEG");
    wizardPage.clickNextNTimes(3);
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPreviousNTimes(3);
    wizardPage.assertIfPageContains("Enrolment Date", "First FEG", "Last FE of first FEG");
    wizardPage.clickNextNTimes(3);
    wizardPage.assertIfPageContains("Summary & Recommendations");
  });
});
