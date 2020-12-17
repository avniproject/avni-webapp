import { dashboardPage } from "./dashboardPage";
import { wizardPage } from "./wizardPage";

export const setupTest = {
  cleanAllOptionsFromRegistration(subjectName) {
    dashboardPage.editProfile(subjectName);
    wizardPage.clickNext();
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
      "Hide first FE of last FEG",
      "Encounter1"
    );
    wizardPage.clickNext();
    wizardPage.clickSave();
  },

  login(username, password) {
    cy.login(username, password);
  }
};
