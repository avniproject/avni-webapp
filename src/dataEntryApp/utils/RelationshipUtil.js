import { find, forEach, get, includes, uniqBy, filter } from "lodash";
import { IndividualRelative } from "avni-models";

export const findApplicableRelations = (relationshipTypes, selectedRelative) => {
  const applicableRelations = [];
  forEach(relationshipTypes, ({ individualAIsToBRelation, individualBIsToARelation }) => {
    const selectedRelativeGender = get(selectedRelative, "gender");
    if (includes(individualAIsToBRelation.genders, selectedRelativeGender)) {
      applicableRelations.push({
        uuid: individualAIsToBRelation.uuid,
        name: individualAIsToBRelation.name,
      });
    }
    if (includes(individualBIsToARelation.genders, selectedRelativeGender)) {
      applicableRelations.push({
        uuid: individualBIsToARelation.uuid,
        name: individualBIsToARelation.name,
      });
    }
  });
  return uniqBy(applicableRelations, "name");
};

export const validateRelative = (relative, individual, selectedRelation, existingRelatives) => {
  const isRelativeAlreadyAdded = !!find(
    existingRelatives,
    (existingRelative) =>
      get(existingRelative, "individualB.uuid") === relative.uuid || get(existingRelative, "individualA.uuid") === relative.uuid,
  );
  if (isRelativeAlreadyAdded) {
    return "relativeAlreadyAdded";
  }
  const individualRelative = IndividualRelative.createEmptyInstance();
  individualRelative.individual.uuid = individual.uuid;
  individualRelative.individual.name = individual.name;
  individualRelative.individual.dateOfBirth = individual.dateOfBirth;
  individualRelative.relative.uuid = relative.uuid;
  individualRelative.relative.name = relative.fullName;
  individualRelative.relative.dateOfBirth = new Date(relative.dateOfBirth);
  individualRelative.relation.uuid = selectedRelation.uuid;
  individualRelative.relation.name = selectedRelation.name;
  const validationResults = individualRelative.validate(existingRelatives, true);
  const failedValidations = find(validationResults, ({ success }) => !success);
  return get(failedValidations, "messageKey");
};

export const getRelationshipType = (individual, relationUUID, relationshipTypes) => {
  const filteredRelationshipTypes = filter(
    relationshipTypes,
    ({ individualAIsToBRelation, individualBIsToARelation }) =>
      individualAIsToBRelation.uuid === relationUUID || individualBIsToARelation.uuid === relationUUID,
  );
  if (filteredRelationshipTypes.length === 1) {
    return filteredRelationshipTypes[0];
  }
  return find(
    filteredRelationshipTypes,
    ({ individualAIsToBRelation, individualBIsToARelation }) =>
      includes(individualAIsToBRelation.genders, individual.gender.name) ||
      includes(individualBIsToARelation.genders, individual.gender.name),
  );
};
