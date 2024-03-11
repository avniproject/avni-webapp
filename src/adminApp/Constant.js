export const programInitialState = {
  name: "",
  colour: "",
  programSubjectLabel: "",
  enrolmentSummaryRule: "",
  enrolmentEligibilityCheckRule: "",
  manualEnrolmentEligibilityCheckRule: "",
  loaded: false
};

export const encounterTypeInitialState = {
  name: "",
  encounterEligibilityCheckRule: "",
  loaded: false
};

export const subjectTypeInitialState = {
  name: "",
  groupRoles: [],
  subjectSummaryRule: "",
  programEligibilityCheckRule: "",
  shouldSyncByLocation: true,
  lastNameOptional: false,
  settings: {
    displayRegistrationDetails: true,
    displayPlannedEncounters: true
  }
};
