/// <reference types="Cypress" />

import { dashboardPage } from "../dashboardPage";
import { wizardPage } from "../wizardPage";

describe("General Enrolment Flow tests for form wizard", () => {
  it("Performing new general encounter should not move to next page in case of validation error", () => {
    dashboardPage.performNewGeneralEncounter("Test Individual", "Encounter1");
    wizardPage.typeInput("Last FE of first FEG", 123);
    wizardPage.assertIfPageContains("123 is invalid");
    wizardPage.clickNext(); //it should not go to next page because of the error.
    wizardPage.assertIfPageContains("First FEG");
  });
});
