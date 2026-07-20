class OrganisationCategory {
  static Production = "Production";
  static UAT = "UAT";
}

export function isProduction(organisation) {
  return organisation?.organisationCategoryName === OrganisationCategory.Production;
}

export function isUAT(organisation) {
  return organisation?.organisationCategoryName === OrganisationCategory.UAT;
}

export default OrganisationCategory;
