/// <reference types="Cypress" />

import { dashboardPage } from "../pages/dashboardPage";
import { wizardPage } from "../pages/wizardPage";
import { setupTest } from "../setup";
import { formWizardOrgPassword, formWizardOrgUsername } from "../../constants";

describe("Program Encounter Flow tests for form wizard", () => {
  beforeEach(() => {
    setupTest.login(formWizardOrgUsername, formWizardOrgPassword);
    setupTest.cleanAllOptionsFromRegistration("Test Individual");
  });
  it("Performing new program encounter should not move to next page in case of validation error", () => {
    dashboardPage.performNewProgramEncounter("Program1", "ProgramEncounter1");
    wizardPage.typeInput("Last FE of first FEG", 123);
    wizardPage.assertIfPageContains("123 is invalid");
    wizardPage.clickNext(); //it should not go to next page because of the error.
    wizardPage.assertIfPageContains("First FEG");
  });
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
      "First FE of second FEG",
      "Last FE of second FEG",
      "Visit Date"
    );
    wizardPage.clickNextNTimes(2);
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPreviousNTimes(2);
    wizardPage.assertIfPageContains(
      "Second FEG",
      "First FE of second FEG",
      "Last FE of second FEG",
      "Visit Date"
    );
    wizardPage.clickNextNTimes(2);
    wizardPage.assertIfPageContains("Summary & Recommendations");
  });
  it("First FEG should be hidden using all FE rule", () => {
    dashboardPage.editProfile("Test Individual");
    wizardPage.clickNext();
    wizardPage.selectOptions("Hide first FE of first FEG", "Hide last FE of first FEG");
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
      "First FE of second FEG",
      "Last FE of second FEG",
      "Visit Date"
    );
    wizardPage.clickNextNTimes(2);
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPreviousNTimes(2);
    wizardPage.assertIfPageContains(
      "Second FEG",
      "First FE of second FEG",
      "Last FE of second FEG",
      "Visit Date"
    );
    wizardPage.clickNextNTimes(2);
    wizardPage.assertIfPageContains("Summary & Recommendations");
  });
  it("First FE should be hidden in first FEG", () => {
    dashboardPage.editProfile("Test Individual");
    wizardPage.clickNext();
    wizardPage.selectOption("Hide first FE of first FEG");
    wizardPage.clickNext();
    wizardPage.clickSave();
    dashboardPage.editProgramEncounter("Program1", "ProgramEncounter1");
    wizardPage.assertIfPageDoesNotContains("First FE of first FEG");
    wizardPage.assertIfPageContains("First FEG", "Last FE of first FEG", "Visit Date");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Second FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Last FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPreviousNTimes(3);
    wizardPage.assertIfPageContains("First FEG", "Last FE of first FEG", "Visit Date");
    wizardPage.clickNextNTimes(3);
    wizardPage.assertIfPageContains("Summary & Recommendations");
  });
  it("Last FE should be hidden in first FEG", () => {
    dashboardPage.editProfile("Test Individual");
    wizardPage.clickNext();
    wizardPage.selectOption("Hide last FE of first FEG");
    wizardPage.clickNext();
    wizardPage.clickSave();
    dashboardPage.editProgramEncounter("Program1", "ProgramEncounter1");
    wizardPage.assertIfPageDoesNotContains("Last FE of first FEG");
    wizardPage.assertIfPageContains("First FEG", "First FE of first FEG", "Visit Date");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Second FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Last FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPreviousNTimes(3);
    wizardPage.assertIfPageDoesNotContains("Last FE of first FEG");
    wizardPage.assertIfPageContains("First FEG", "First FE of first FEG", "Visit Date");
    wizardPage.clickNextNTimes(3);
    wizardPage.assertIfPageContains("Summary & Recommendations");
  });
  it("Second FEG is hidden using FEG rule", () => {
    dashboardPage.editProfile("Test Individual");
    wizardPage.clickNext();
    wizardPage.selectOption("Hide second FEG");
    wizardPage.clickNext();
    wizardPage.clickSave();
    dashboardPage.editProgramEncounter("Program1", "ProgramEncounter1");
    wizardPage.assertIfPageContains(
      "First FEG",
      "First FE of first FEG",
      "Last FE of first FEG",
      "Visit Date"
    );
    wizardPage.clickNext();
    wizardPage.assertIfPageDoesNotContains(
      "Second FEG",
      "First FE of second FEG",
      "Last FE of second FEG"
    );
    wizardPage.assertIfPageContains("Last FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPreviousNTimes(2);
    wizardPage.assertIfPageDoesNotContains(
      "Second FEG",
      "First FE of second FEG",
      "Last FE of second FEG"
    );
    wizardPage.assertIfPageContains(
      "First FEG",
      "First FE of first FEG",
      "Last FE of first FEG",
      "Visit Date"
    );
    wizardPage.clickNextNTimes(2);
    wizardPage.assertIfPageContains("Summary & Recommendations");
  });
  it("Second FEG is hidden using all FE rule", () => {
    dashboardPage.editProfile("Test Individual");
    wizardPage.clickNext();
    wizardPage.selectOptions("Hide first FE of second FEG", "Hide last FE of second FEG");
    wizardPage.clickNext();
    wizardPage.clickSave();
    dashboardPage.editProgramEncounter("Program1", "ProgramEncounter1");
    wizardPage.assertIfPageContains(
      "First FEG",
      "First FE of first FEG",
      "Last FE of first FEG",
      "Visit Date"
    );
    wizardPage.clickNext();
    wizardPage.assertIfPageDoesNotContains(
      "Second FEG",
      "First FE of second FEG",
      "Last FE of second FEG"
    );
    wizardPage.assertIfPageContains("Last FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPreviousNTimes(2);
    wizardPage.assertIfPageDoesNotContains(
      "Second FEG",
      "First FE of second FEG",
      "Last FE of second FEG"
    );
    wizardPage.assertIfPageContains(
      "First FEG",
      "First FE of first FEG",
      "Last FE of first FEG",
      "Visit Date"
    );
    wizardPage.clickNextNTimes(2);
    wizardPage.assertIfPageContains("Summary & Recommendations");
  });
  it("First FE in second FEG is hidden", () => {
    dashboardPage.editProfile("Test Individual");
    wizardPage.clickNext();
    wizardPage.selectOption("Hide first FE of second FEG");
    wizardPage.clickNext();
    wizardPage.clickSave();
    dashboardPage.editProgramEncounter("Program1", "ProgramEncounter1");
    wizardPage.assertIfPageContains(
      "First FEG",
      "First FE of first FEG",
      "Last FE of first FEG",
      "Visit Date"
    );
    wizardPage.clickNext();
    wizardPage.assertIfPageDoesNotContains("First FE of second FEG");
    wizardPage.assertIfPageContains("Second FEG", "Last FE of second FEG");
    wizardPage.clickNextNTimes(2);
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPreviousNTimes(3);
    wizardPage.assertIfPageContains(
      "First FEG",
      "First FE of first FEG",
      "Last FE of first FEG",
      "Visit Date"
    );
    wizardPage.clickNextNTimes(3);
    wizardPage.assertIfPageContains("Summary & Recommendations");
  });
  it("Last FE in second FEG is hidden", () => {
    dashboardPage.editProfile("Test Individual");
    wizardPage.clickNext();
    wizardPage.selectOption("Hide last FE of second FEG");
    wizardPage.clickNext();
    wizardPage.clickSave();
    dashboardPage.editProgramEncounter("Program1", "ProgramEncounter1");
    wizardPage.assertIfPageContains(
      "First FEG",
      "First FE of first FEG",
      "Last FE of first FEG",
      "Visit Date"
    );
    wizardPage.clickNext();
    wizardPage.assertIfPageDoesNotContains("Last FE of second FEG");
    wizardPage.assertIfPageContains("Second FEG", "First FE of second FEG");
    wizardPage.clickNextNTimes(2);
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPreviousNTimes(3);
    wizardPage.assertIfPageContains(
      "First FEG",
      "First FE of first FEG",
      "Last FE of first FEG",
      "Visit Date"
    );
    wizardPage.clickNextNTimes(3);
    wizardPage.assertIfPageContains("Summary & Recommendations");
  });
  it("Last FEG should be hidden using FEG rule", () => {
    dashboardPage.editProfile("Test Individual");
    wizardPage.clickNext();
    wizardPage.selectOption("Hide last FEG");
    wizardPage.clickNext();
    wizardPage.clickSave();
    dashboardPage.editProgramEncounter("Program1", "ProgramEncounter1");
    wizardPage.assertIfPageContains(
      "First FEG",
      "First FE of first FEG",
      "Last FE of first FEG",
      "Visit Date"
    );
    wizardPage.clickNextNTimes(2);
    wizardPage.assertIfPageDoesNotContains(
      "Last FEG",
      "First FE of last FEG",
      "Last FE of last FEG"
    );
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains(
      "Second FEG",
      "First FE of second FEG",
      "Last FE of second FEG"
    );
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
  });
  it("Last FEG is hidden using all FE rule", () => {
    dashboardPage.editProfile("Test Individual");
    wizardPage.clickNext();
    wizardPage.selectOptions("Hide first FE of last FEG", "Hide last FE of last FEG");
    wizardPage.clickNext();
    wizardPage.clickSave();
    dashboardPage.editProgramEncounter("Program1", "ProgramEncounter1");
    wizardPage.assertIfPageContains(
      "First FEG",
      "First FE of first FEG",
      "Last FE of first FEG",
      "Visit Date"
    );
    wizardPage.clickNextNTimes(2);
    wizardPage.assertIfPageDoesNotContains(
      "Last FEG",
      "First FE of last FEG",
      "Last FE of last FEG"
    );
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPreviousNTimes(2);
    wizardPage.assertIfPageContains("First FEG", "First FE of first FEG", "Last FE of first FEG");
    wizardPage.clickNextNTimes(2);
    wizardPage.assertIfPageContains("Summary & Recommendations");
  });
  it("First FE in last FEG is hidden", () => {
    dashboardPage.editProfile("Test Individual");
    wizardPage.clickNext();
    wizardPage.selectOption("Hide first FE of last FEG");
    wizardPage.clickNext();
    wizardPage.clickSave();
    dashboardPage.editProgramEncounter("Program1", "ProgramEncounter1");
    wizardPage.assertIfPageContains(
      "First FEG",
      "First FE of first FEG",
      "Last FE of first FEG",
      "Visit Date"
    );
    wizardPage.clickNextNTimes(2);
    wizardPage.assertIfPageDoesNotContains("First FE of last FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPreviousNTimes(3);
    wizardPage.assertIfPageContains("First FEG", "First FE of first FEG", "Last FE of first FEG");
    wizardPage.clickNextNTimes(3);
    wizardPage.assertIfPageContains("Summary & Recommendations");
  });
  it("Last FE in last FEG is hidden", () => {
    dashboardPage.editProfile("Test Individual");
    wizardPage.clickNext();
    wizardPage.selectOption("Hide last FE of last FEG");
    wizardPage.clickNext();
    wizardPage.clickSave();
    dashboardPage.editProgramEncounter("Program1", "ProgramEncounter1");
    wizardPage.assertIfPageContains(
      "First FEG",
      "First FE of first FEG",
      "Last FE of first FEG",
      "Visit Date"
    );
    wizardPage.clickNextNTimes(2);
    wizardPage.assertIfPageDoesNotContains("Last FE of last FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPreviousNTimes(3);
    wizardPage.assertIfPageContains("First FEG", "First FE of first FEG", "Last FE of first FEG");
    wizardPage.clickNextNTimes(3);
    wizardPage.assertIfPageContains("Summary & Recommendations");
  });
  it("All the FE in the form are hidden", () => {
    dashboardPage.editProfile("Test Individual");
    wizardPage.clickNext();
    wizardPage.selectOptions(
      "Hide first FE of first FEG",
      "Hide last FE of last FEG",
      "Hide last FE of first FEG",
      "Hide first FE of second FEG",
      "Hide last FE of second FEG",
      "Hide first FE of last FEG"
    );
    wizardPage.clickNext();
    wizardPage.clickSave();
    dashboardPage.editProgramEncounter("Program1", "ProgramEncounter1");
    wizardPage.assertIfPageContains("Visit Date");
    wizardPage.assertIfPageDoesNotContains(
      "First FEG",
      "First FE of first FEG",
      "Last FE of first FEG"
    );
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("Visit Date");
    wizardPage.assertIfPageDoesNotContains(
      "First FEG",
      "First FE of first FEG",
      "Last FE of first FEG"
    );
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
  });
  it("An Empty encounter without any FEG created", () => {
    dashboardPage.performNewProgramEncounter("Program1", "Empty Program Encounter");
    wizardPage.assertIfPageContains("Visit Date");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
  });
  it("Another FEG in same form is hidden by skip logic in current form", () => {
    dashboardPage.editProgramEncounter("Program1", "ProgramEncounter1");
    wizardPage.assertIfPageContains("Visit Date", "First FE of first FEG", "Last FE of first FEG");
    wizardPage.selectOption("Hide second FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageDoesNotContains("Second FEG");
    wizardPage.assertIfPageContains("Last FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPreviousNTimes(2);
    wizardPage.assertIfPageContains("Visit Date", "First FE of first FEG", "Last FE of first FEG");
    wizardPage.clickNextNTimes(2);
    wizardPage.assertIfPageContains("Summary & Recommendations");
  });
  it("FE in same group in same form is hidden", () => {
    dashboardPage.editProgramEncounter("Program1", "ProgramEncounter1");
    wizardPage.assertIfPageContains("Visit Date", "First FE of first FEG", "Last FE of first FEG");
    wizardPage.selectOption("Hide last FE of first FEG");
    wizardPage.assertIfPageDoesNotContains("Last FE of first FEG");
    wizardPage.clickNextNTimes(3);
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPreviousNTimes(3);
    wizardPage.assertIfPageContains("Visit Date", "First FE of first FEG");
    wizardPage.assertIfPageDoesNotContains("Last FE of first FEG");
    wizardPage.clickNextNTimes(3);
    wizardPage.assertIfPageContains("Summary & Recommendations");
  });
  it("FE in another group in same form is hidden", () => {
    dashboardPage.editProgramEncounter("Program1", "ProgramEncounter1");
    wizardPage.assertIfPageContains("Visit Date", "First FE of first FEG", "Last FE of first FEG");
    wizardPage.selectOption("Hide first FE of second FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Second FEG", "First FE of second FEG");
    wizardPage.assertIfPageDoesNotContains("Last FE of second FEG");
    wizardPage.clickNextNTimes(2);
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPreviousNTimes(2);
    wizardPage.assertIfPageContains("Second FEG", "First FE of second FEG");
    wizardPage.assertIfPageDoesNotContains("Last FE of second FEG");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("Visit Date", "First FEG");
    wizardPage.clickNextNTimes(3);
    wizardPage.assertIfPageContains("Summary & Recommendations");
  });
  it("Performing new program encounter should not move to next page in case of validation error in visit date", () => {
    dashboardPage.editProgramEncounter("Program1", "ProgramEncounter1");

    wizardPage.enterDate("Visit Date", "11/01/2021");
    wizardPage.assertIfPageContains("Encounter date cannot be in future");
    wizardPage.clickNext(); //it should not go to next page because of the error.
    wizardPage.assertIfPageContains("First FEG");
  });
});
