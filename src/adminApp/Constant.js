export const programInitialState = {
  name: "",
  colour: "",
  programSubjectLabel: "",
  enrolmentSummaryRule: "",
  enrolmentEligibilityCheckRule: "",
  manualEnrolmentEligibilityCheckRule: "",
  manualEligibilityCheckRequired: false,
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
  memberAdditionEligibilityCheckRule: "",
  shouldSyncByLocation: true,
  lastNameOptional: false,
  settings: {
    displayRegistrationDetails: true,
    displayPlannedEncounters: true
  }
};
