/// <reference types="Cypress" />

import { dashboardPage } from "../pages/dashboardPage";
import { wizardPage } from "../pages/wizardPage";
import { setupTest } from "../setup";
import { formWizardOrgPassword, formWizardOrgUsername } from "../../constants";

describe("Program Enrolment Exit Flow tests for form wizard", () => {
  beforeEach(() => {
    setupTest.login(formWizardOrgUsername, formWizardOrgPassword);
    setupTest.cleanAllOptionsFromIndividualRegistration("Test Individual");
  });
});
