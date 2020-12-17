import { dashboardPage } from "../dashboardPage";
import { wizardPage } from "../wizardPage";

describe("Program Encounter Flow tests for form wizard", () => {
  it("Performing new program encounter should not move to next page in case of validation error", () => {
    dashboardPage.performNewProgramEncounter("Test Individual", "Program1", "ProgramEncounter1");
    wizardPage.typeInput("Last FE of first FEG", 123);
    wizardPage.assertIfPageContains("123 is invalid");
    wizardPage.clickNext(); //it should not go to next page because of the error.
    wizardPage.assertIfPageContains("First FEG");
  });
});
