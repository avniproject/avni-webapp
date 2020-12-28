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
  }
};
