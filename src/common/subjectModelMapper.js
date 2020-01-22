import {
  Individual,
  ModelGeneral as General,
  Observation,
  Concept,
  IndividualRelationship,
  IndividualRelationshipType
} from "avni-models";

export const mapProfile = subjectProfile => {
  debugger;
  let individual = General.assignFields(
    subjectProfile,
    new Individual(),
    ["uuid", "firstName", "lastName", "dateOfBirth", "gender"],
    ["registrationDate"]
  );
  individual.lowestAddressLevel = subjectProfile["fullAddress"];
  individual.observations = mapObservation(subjectProfile["observations"]);
  individual.relationships = mapRelationships(subjectProfile["relationships"]);
  console.log(individual);
  return individual;
};

export const mapRelationships = relationshipList => {
  return relationshipList.map(relationship => {
    return mapRelations(relationship);
  });
};

export const mapRelations = relationShipJson => {
  const individualRelationship = General.assignFields(
    relationShipJson,
    new IndividualRelationship(),
    ["uuid"]
  );
  individualRelationship.relationship = new IndividualRelationshipType();
  individualRelationship.individualB = new Individual();
  individualRelationship.relationship.uuid = relationShipJson["relationshipTypeUuid"];
  individualRelationship.relationship.individualBIsToARelation =
    relationShipJson["individualBIsToARelation"];
  individualRelationship.individualB.uuid = relationShipJson["individualBUuid"];
  return individualRelationship;
};

export const mapObservation = objservationList => {
  return objservationList.map(observation => {
    return mapConcept(observation);
  });
};

export const mapConcept = observationJson => {
  const observation = new Observation();
  const concept = General.assignFields(observationJson.concept, new Concept(), ["uuid", "name"]);
  concept.datatype = observationJson.concept["dataType"];
  const value = JSON.stringify(concept.getValueWrapperFor(observationJson.value));
  observation.concept = concept;
  observation.valueJSON = value;
  return observation;
};
//1 Utility - generic mapping models object.
//2 UI bind - as pwer current structure.
//3 Common component - generic for all support.
