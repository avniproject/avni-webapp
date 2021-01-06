import { dashboardPage } from "./pages/dashboardPage";
import { wizardPage } from "./pages/wizardPage";

export const setupTest = {
  cleanAllOptionsFromPersonRegistration(subjectName) {
    dashboardPage.editProfile(subjectName);
    wizardPage.clickNext();
    cy.get(":checkbox").uncheck();
    wizardPage.clickNextNTimes(4);
    wizardPage.clickSave();
  },
  cleanAllOptionsFromIndividualRegistration(subjectName) {
    dashboardPage.editProfile(subjectName);
    cy.get(":checkbox").uncheck();
    wizardPage.clickNext();
    wizardPage.clickSave();
  },
  cleanAllOptionsFromEnrolment(subjectName, programName) {
    dashboardPage.openDashboard(subjectName);
    dashboardPage.editProgramEnrolment(programName);
    cy.get(":checkbox").uncheck();
    wizardPage.clickNextNTimes(3);
    wizardPage.clickSave();
  },
  login(username, password) {
    cy.login(username, password);
  },
  cleanAllOptionsFromNonIndiRegistration(subjectName) {
    dashboardPage.editProfile(subjectName);
    wizardPage.unCheckOptions(
      "Hide first FEG",
      "Hide last FEG",
      "Hide second FEG",
      "Hide first FE of first FEG",
      "Hide last FE of last FEG",
      "Hide all FEs in first FEG",
      "Hide last FE of first FEG",
      "Hide first FE of second FEG",
      "Hide last FE of second FEG",
      "Hide first FE of last FEG"
    );
    wizardPage.clickNext();
    wizardPage.clickSave();
  }
};
