/// <reference types="Cypress" />

import { dashboardPage } from "../pages/dashboardPage";
import { wizardPage } from "../pages/wizardPage";
import { setupTest } from "../setup";
import { formWizardOrgPassword, formWizardOrgUsername } from "../../constants";

describe("Program Enrolment Flow tests for form wizard", () => {
  beforeEach(() => {
    setupTest.login(formWizardOrgUsername, formWizardOrgPassword);
    setupTest.cleanAllOptionsFromRegistration("Test Individual");
    setupTest.cleanAllOptionsFromEnrolment("Test Individual", "Program1");
  });
  it("Enrolment page should give validation error and should not move to next page", () => {
    dashboardPage.openDashboard("Test Individual");
    dashboardPage.editProgramEnrolment("Program1");
    wizardPage.typeInput("Last FE of first FEG", 123);
    wizardPage.assertIfPageContains("123 is invalid");
    wizardPage.clickNext(); //it should not go to next page because of the error.
    wizardPage.assertIfPageContains("First FEG");
  });
  it.only("First FEG should be hidden by FEG rule", () => {
    wizardPage.modifyRegistration("Test Individual", "Hide first FEG");
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
    wizardPage.clickNext();
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPrevious();
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains(
      "Second FEG",
      "Enrolment Date",
      "First FE of second FEG",
      "Last FE of second FEG"
    );
    wizardPage.clickNext();
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
  });
  it("First FEG should be hidden by all FE rule", () => {
    wizardPage.modifyRegistration(
      "Test Individual",
      "Hide first FE of first FEG",
      "Hide last FE of first FEG"
    );
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
    wizardPage.clickNext();
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPrevious();
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains(
      "Second FEG",
      "Enrolment Date",
      "First FE of second FEG",
      "Last FE of second FEG"
    );
    wizardPage.clickNext();
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
  });
  it("First FE in first FEG is hidden", () => {
    wizardPage.modifyRegistration("Test Individual", "Hide first FE of first FEG");
    dashboardPage.editProgramEnrolment("Program1");
    wizardPage.assertIfPageContains("Enrolment Date", "First FEG", "Last FE of first FEG");
    wizardPage.assertIfPageDoesNotContains("First FE of first FEG");
    wizardPage.clickNext();
    wizardPage.clickNext();
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPrevious();
    wizardPage.clickPrevious();
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("Enrolment Date", "First FEG", "Last FE of first FEG");
    wizardPage.clickNext();
    wizardPage.clickNext();
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
  });
  it("Last FE in first FEG is hidden", () => {
    wizardPage.modifyRegistration("Test Individual", "Hide last FE of first FEG");
    dashboardPage.editProgramEnrolment("Program1");
    wizardPage.assertIfPageContains("Enrolment Date", "First FEG", "First FE of first FEG");
    wizardPage.assertIfPageDoesNotContains("Last FE of first FEG");
    wizardPage.clickNext();
    wizardPage.clickNext();
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPrevious();
    wizardPage.clickPrevious();
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("Enrolment Date", "First FEG", "First FE of first FEG");
    wizardPage.assertIfPageDoesNotContains("Last FE of first FEG");
    wizardPage.clickNext();
    wizardPage.clickNext();
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
  });
  it("Second FEG should be hidden by FEG rule", () => {
    dashboardPage.modifyRegistration("Test Individual", "Hide second FEG");
    dashboardPage.editProgramEnrolment("Program1");
    wizardPage.assertIfPageContains(
      "Enrolment Date",
      "First FEG",
      "First FE of first FEG",
      "Last FE of first FEG"
    );
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Last FEG", "First FE of last FEG", "Last FE of last FEG");
    wizardPage.assertIfPageDoesNotContains("Second FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPrevious();
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains(
      "First FEG",
      "Enrolment Date",
      "First FE of first FEG",
      "Last FE of first FEG"
    );
    wizardPage.clickNext();
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
  });
  it("Second FEG is hidden using all FE rule", () => {
    dashboardPage.modifyRegistration(
      "Test Individual",
      "Hide first FE of second FEG",
      "Hide last FE of second FEG"
    );
    dashboardPage.editProgramEnrolment("Program1");
    wizardPage.assertIfPageContains(
      "Enrolment Date",
      "First FEG",
      "First FE of first FEG",
      "Last FE of first FEG"
    );
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Last FEG", "First FE of last FEG", "Last FE of last FEG");
    wizardPage.assertIfPageDoesNotContains("Second FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPrevious();
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains(
      "First FEG",
      "Enrolment Date",
      "First FE of first FEG",
      "Last FE of first FEG"
    );
    wizardPage.clickNext();
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
  });
  it("First FE in second FEG is hidden", () => {
    dashboardPage.modifyRegistration("Test Individual", "Hide first FE of second FEG");
    dashboardPage.editProgramEnrolment("Program1");
    wizardPage.assertIfPageContains(
      "Enrolment Date",
      "First FEG",
      "First FE of first FEG",
      "Last FE of first FEG"
    );
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Second FEG", "Last FE of second FEG");
    wizardPage.assertIfPageDoesNotContains("First FE of second FEG");
    wizardPage.clickNext();
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPrevious();
    wizardPage.clickPrevious();
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains(
      "First FEG",
      "Enrolment Date",
      "First FE of first FEG",
      "Last FE of first FEG"
    );
    wizardPage.clickNext();
    wizardPage.clickNext();
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
  });
  it("Last FE in second FEG is hidden", () => {
    dashboardPage.modifyRegistration("Test Individual", "Hide last FE of second FEG");
    dashboardPage.editProgramEnrolment("Program1");
    wizardPage.assertIfPageContains(
      "Enrolment Date",
      "First FEG",
      "First FE of first FEG",
      "Last FE of first FEG"
    );
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Second FEG", "First FE of second FEG");
    wizardPage.assertIfPageDoesNotContains("Last FE of second FEG");
    wizardPage.clickNext();
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPrevious();
    wizardPage.clickPrevious();
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains(
      "First FEG",
      "Enrolment Date",
      "First FE of first FEG",
      "Last FE of first FEG"
    );
    wizardPage.clickNext();
    wizardPage.clickNext();
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
  });
  it("Last FEG should be hidden by FEG rule", () => {
    dashboardPage.modifyRegistration("Test Individual", "Hide last FEG");
    dashboardPage.editProgramEnrolment("Program1");
    wizardPage.assertIfPageContains(
      "Enrolment Date",
      "First FEG",
      "First FE of first FEG",
      "Last FE of first FEG"
    );
    wizardPage.clickNext();
    wizardPage.clickNext();
    wizardPage.assertIfPageDoesNotContains("Last FEG");
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPrevious();
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains(
      "First FEG",
      "Enrolment Date",
      "First FE of first FEG",
      "Last FE of first FEG"
    );
    wizardPage.clickNext();
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
  });
  it("Last FEG is hidden using all FE rule", () => {
    dashboardPage.modifyRegistration(
      "Test Individual",
      "Hide first FE of last FEG",
      "Hide last FE of last FEG"
    );
    dashboardPage.editProgramEnrolment("Program1");
    wizardPage.assertIfPageContains(
      "Enrolment Date",
      "First FEG",
      "First FE of first FEG",
      "Last FE of first FEG"
    );
    wizardPage.clickNext();
    wizardPage.clickNext();
    wizardPage.assertIfPageDoesNotContains("Last FEG");
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPrevious();
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains(
      "First FEG",
      "Enrolment Date",
      "First FE of first FEG",
      "Last FE of first FEG"
    );
    wizardPage.clickNext();
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
  });
  it("First FE in last FEG is hidden", () => {
    dashboardPage.modifyRegistration("Test Individual", "Hide first FE of last FEG");
    dashboardPage.editProgramEnrolment("Program1");
    wizardPage.assertIfPageContains(
      "Enrolment Date",
      "First FEG",
      "First FE of first FEG",
      "Last FE of first FEG"
    );
    wizardPage.clickNext();
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Last FEG", "Last FE of last FEG");
    wizardPage.assertIfPageDoesNotContains("First FE of last FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPrevious();
    wizardPage.clickPrevious();
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains(
      "First FEG",
      "Enrolment Date",
      "First FE of first FEG",
      "Last FE of first FEG"
    );
    wizardPage.clickNext();
    wizardPage.clickNext();
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
  });
  it("Last FE in last FEG is hidden", () => {
    dashboardPage.modifyRegistration("Test Individual", "Hide last FE of last FEG");
    dashboardPage.editProgramEnrolment("Program1");
    wizardPage.assertIfPageContains(
      "Enrolment Date",
      "First FEG",
      "First FE of first FEG",
      "Last FE of first FEG"
    );
    wizardPage.clickNext();
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Last FEG", "First FE of last FEG");
    wizardPage.assertIfPageDoesNotContains("Last FE of last FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPrevious();
    wizardPage.clickPrevious();
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains(
      "First FEG",
      "Enrolment Date",
      "First FE of first FEG",
      "Last FE of first FEG"
    );
    wizardPage.clickNext();
    wizardPage.clickNext();
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
  });
  it("All the FE in the form are hidden", () => {
    dashboardPage.modifyRegistration(
      "Test Individual",
      "Hide first FE of first FEG",
      "Hide last FE of last FEG",
      "Hide first FE of second FEG",
      "Hide last FE of second FEG",
      "Hide first FE of last FEG",
      "Hide last FE of first FEG"
    );
    dashboardPage.editProgramEnrolment("Program1");
    wizardPage.assertIfPageDoesNotContains(
      "First FEG",
      "First FE of first FEG",
      "Last FE of first FEG"
    );
    wizardPage.assertIfPageContains("Enrolment Date");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("Enrolment Date");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
  });
  it("Performing new program encounter should not move to next page in case of validation error in visit date", () => {
    dashboardPage.editProgramEnrolment("Program1");
    wizardPage.enterDate("Enrolment Date", "11/01/2021");
    wizardPage.assertIfPageContains("Enrolment date cannot be in future");
    wizardPage.clickNext(); //it should not go to next page because of the error.
    wizardPage.assertIfPageContains("First FEG");
  });
  it("An Empty enrolment form without any FEG created", () => {
    dashboardPage.editProgramEnrolment("EmptyProgram");
    wizardPage.assertIfPageContains("Enrolment Date");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
  });
  it("Another FEG in same form is hidden by skip logic in current form", () => {
    dashboardPage.editProgramEnrolment("Program1");
    wizardPage.selectOption("Hide second FEG");
    wizardPage.assertIfPageContains("First FEG", "Enrolment Date", "Last FE of first FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageDoesNotContains(
      "Second FEG",
      "First FE of second FEG",
      "Last FE of second FEG"
    );
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("Last FEG");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("First FEG");
  });
  it("FE in same group in same form is hidden", () => {
    dashboardPage.editProgramEnrolment("Program1");
    wizardPage.selectOption("Hide last FE of first FEG");
    wizardPage.assertIfPageContains("First FEG", "Enrolment Date");
    wizardPage.assertIfPageDoesNotContains("Last FE of first FEG");
    wizardPage.clickNext();
    wizardPage.clickNext();
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPrevious();
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("Second FEG", "Last FE of second FEG");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageDoesNotContains("Last FE of first FEG");
    wizardPage.clickNext();
    wizardPage.clickNext();
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
  });
  it("FE in another group in same form is hidden", () => {
    dashboardPage.editProgramEnrolment("Program1");
    wizardPage.selectOption("Hide first FE of second FEG");
    wizardPage.assertIfPageContains("First FEG", "Enrolment Date");
    wizardPage.clickNext();
    wizardPage.assertIfPageDoesNotContains("First FE of second FEG");
    wizardPage.assertIfPageContains("Second FEG", "Last FE of second FEG");
    wizardPage.clickNext();
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPrevious();
    wizardPage.clickPrevious();
    wizardPage.assertIfPageDoesNotContains("First FE of second FEG");
    wizardPage.assertIfPageContains("Second FEG", "Last FE of second FEG");
    wizardPage.clickNext();
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
  });
});
