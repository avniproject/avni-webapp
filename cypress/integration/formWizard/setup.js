import { dashboardPage } from "./pages/dashboardPage";
import { wizardPage } from "./pages/wizardPage";

export const setupTest = {
  cleanAllOptionsFromRegistration(subjectName) {
    dashboardPage.editProfile(subjectName);
    wizardPage.clickNext();
    cy.get(":checkbox").uncheck();
    wizardPage.clickNext();
    wizardPage.clickSave();
  },

  login(username, password) {
    cy.login(username, password);
  }
};
