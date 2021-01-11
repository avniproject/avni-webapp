import { URL } from "../constants";

export const dashboardPage = {
  openDashboard(subjectName) {
    cy.visit(`${URL}#/app`);
    // cy.window().then(win => (win.location.hash = "/app"));
    cy.get(`[value="${subjectName}"] > a`).click();
  },
  editProfile(subjectName) {
    dashboardPage.openDashboard(subjectName);
    cy.get("#profile-tab").click();
    cy.get("#profile-detail").click();
    cy.get("#edit-profile").click();
    cy.wait(1000);
  },
  enrolInProgram(subjectName, programName) {
    dashboardPage.openDashboard(subjectName);
    cy.get("#Enrol-in-Program").click();
    cy.get("#selected_program-native-helper").select(programName);
    cy.get("#save-required-dialog-button").click();
  },
  openProgram: function(programName) {
    cy.get(`#${this.generateIdFromName(programName)}`).click();
    cy.wait(1000);
  },
  generateIdFromName: function(string) {
    return string.replaceAll(" ", "-");
  },
  editProgramEnrolment(programName) {
    this.openProgram(programName);
    cy.get("#enrolment-details").click();
    cy.get("#edit-program").click();
    cy.wait(1000);
  },
  exitProgram(programName) {
    this.openProgram(programName);
    cy.get("#enrolment-details").click();
    cy.get("#exit-program").click();
    cy.wait(1000);
  },
  performNewProgramEncounter(programName, encounterTypeName) {
    this.openProgram(programName);
    cy.get("#new-program-visit").click();
    cy.get(`#${this.generateIdFromName(encounterTypeName)}`).click();
    cy.wait(1000);
  },
  preformScheduledProgramEncounter(programName, encounterName) {
    this.openProgram(programName);
    cy.get("#planned-program-encounter-details").click();
    cy.get(`#do-visit-${this.generateIdFromName(encounterName)}`).click();
    cy.wait(1000);
  },
  cancelProgramEncounter(programName, encounterName) {
    this.openProgram(programName);
    cy.get("#planned-program-encounter-details").click();
    cy.get(`#cancel-visit-${this.generateIdFromName(encounterName)}`).click();
    cy.wait(1000);
  },
  editProgramEncounter(programName, encounterName) {
    this.openProgram(programName);
    cy.get("#completed-program-encounter-details").click();
    cy.get(`#edit-visit-${this.generateIdFromName(encounterName)}`).click();
    cy.wait(1000);
  },
  openGeneralTab: function() {
    cy.get("#general-tab").click();
  },
  performNewGeneralEncounter(encounterTypeName) {
    this.openGeneralTab();
    cy.wait(1000);
    cy.get("#new-general-visit").click();
    cy.get(`#${this.generateIdFromName(encounterTypeName)}`).click();
  },
  performScheduledGeneralEncounter(encounterName) {
    this.openGeneralTab();
    cy.get("#planned-general-encounter-details").click();
    cy.get(`#do-visit-${this.generateIdFromName(encounterName)}`).click();
  },
  cancelGeneralEncounter(encounterName) {
    this.openGeneralTab();
    cy.get("#planned-general-encounter-details").click();
    cy.get(`#cancel-visit-${this.generateIdFromName(encounterName)}`).click();
  },
  editGeneralEncounter(encounterName) {
    this.openGeneralTab();
    cy.get("#completed-general-encounter-details").click();
    cy.get(`#edit-visit-${this.generateIdFromName(encounterName)}`).click();
  }
};
