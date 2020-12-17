/// <reference types="Cypress" />

import { setupTest } from "../setup";
import { formWizardOrgPassword, formWizardOrgUsername } from "../../constants";

describe("Program Encounter Cancel Flow tests for form wizard", () => {
  beforeEach(() => {
    setupTest.login(formWizardOrgUsername, formWizardOrgPassword);
    setupTest.cleanAllOptionsFromRegistration("Test Individual");
  });
});
