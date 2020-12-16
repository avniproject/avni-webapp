/// <reference types="Cypress" />

describe("Form Wizard Tests", () => {
  it("Login and open Data Entry App", () => {
    cy.login({ username: "admin@hiren2", password: "password" });
    cy.contains("Data Entry").click();
  });
  it("All four groups are visible in the Person registration form", () => {
    cy.editProfile("Test Person");
    cy.clickNextNTimes(5);
    cy.pageContains("Summary & Recommendations");
  });
  //TODO: uncomment it after fixing the bug
  // it("First form element group should be hidden when first name is 'Hide first FEG'", () => {
  //     cy.editProfile('Test Person');
  //     cy.typeInput('firstName', 'Hide first FEG');
  //     cy.clickNext();
  //     cy.pageContains("First FEG");
  //     cy.clickNextNTimes(3);
  //     cy.pageContains("Summary & Recommendations");
  //     cy.clickPreviousNTimes(4);
  //     cy.pageContains("Register Person");
  //     cy.clickNextNTimes(4);
  //     cy.pageContains("Summary & Recommendations");
  // });
  it("Second FEG should be hidden when option 'Hide first FEG' is selected", () => {
    cy.editProfile("Test Person");
    cy.clickNext();
    cy.selectOption("Hide first FEG");
    cy.clickNext();
    cy.pageContains("Second FEG", "First FE of Second FEG", "Last FE of Second FG");
    cy.clickNextNTimes(2);
    cy.pageContains("Summary & Recommendations", "Hide first FEG");
    cy.clickPreviousNTimes(4);
    cy.pageContains("Register Person");
    cy.clickNextNTimes(4);
    cy.pageContains("Summary & Recommendations", "Hide first FEG");
  });
  it("Second FEG should be hidden when all FE of the group are hidden", () => {
    cy.editProfile("Test Person");
    cy.clickNext();
    cy.selectOption("Hide all FEs in first FEG");
    cy.clickNext();
    cy.pageContains("Second FEG", "First FE of Second FEG", "Last FE of Second FG");
    cy.clickNextNTimes(2);
    cy.pageContains("Summary & Recommendations", "Hide all FEs in first FEG");
    cy.clickPreviousNTimes(4);
    cy.pageContains("Register Person");
    cy.clickNextNTimes(4);
    cy.pageContains("Summary & Recommendations", "Hide all FEs in first FEG");
  });
  it("First FE in second FEG should be hidden when option 'Hide first FE of first FEG' is selected", () => {
    cy.editProfile("Test Person");
    cy.clickNext();
    cy.selectOption("Hide first FE of first FEG");
    cy.clickNext();
    cy.pageContains("First FEG", "Last FE of first FEG");
    cy.pageExcludes("First FE of Second FEG");
    cy.clickNextNTimes(3);
    cy.pageContains("Summary & Recommendations", "Hide first FE of first FEG");
    cy.clickPreviousNTimes(5);
    cy.pageContains("Register Person");
    cy.clickNextNTimes(5);
    cy.pageContains("Summary & Recommendations", "Hide first FE of first FEG");
  });
  it("Last FE in second FEG should be hidden when option 'Hide last FE of first FEG' is selected", () => {
    cy.editProfile("Test Person");
    cy.clickNext();
    cy.selectOption("Hide last FE of first FEG");
    cy.clickNext();
    cy.pageContains("First FEG", "First FE of first FEG");
    cy.pageExcludes("Last FE of first FEG");
    cy.clickNextNTimes(3);
    cy.pageContains("Summary & Recommendations", "Hide last FE of first FEG");
    cy.clickPreviousNTimes(5);
    cy.pageContains("Register Person");
    cy.clickNextNTimes(5);
    cy.pageContains("Summary & Recommendations", "Hide last FE of first FEG");
  });
  it("Last FEG should be hidden when option 'Hide last FEG' is selected", () => {
    cy.editProfile("Test Person");
    cy.clickNext();
    cy.selectOption("Hide last FEG");
    cy.clickNext();
    cy.pageContains("First FEG", "First FE of first FEG", "Last FE of first FEG");
    cy.clickNextNTimes(2);
    cy.pageContains("Summary & Recommendations", "Hide last FEG");
    cy.clickPreviousNTimes(4);
    cy.pageContains("Register Person");
    cy.clickNextNTimes(4);
    cy.pageContains("Summary & Recommendations", "Hide last FEG");
  });
});
