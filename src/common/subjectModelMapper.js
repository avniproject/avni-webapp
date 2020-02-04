import { storeDispachObservations } from "../../src/common/utils/reduxStoreUtilty";

import {
  Individual,
  ModelGeneral as General,
  Observation,
  Concept,
  ProgramEncounter,
  Program,
  ProgramEnrolment,
  IndividualRelationship,
  IndividualRelationshipType
} from "avni-models";
import { types } from "../common/store/commonReduxStoreReducer";

export const mapProfile = subjectProfile => {
  // debugger;
  let individual = General.assignFields(
    subjectProfile,
    new Individual(),
    ["uuid", "firstName", "lastName", "dateOfBirth", "gender"],
    ["registrationDate"]
  );
  individual.lowestAddressLevel = subjectProfile["fullAddress"];
  individual.observations = mapObservation(subjectProfile["observations"]);
  // individual.relationships = mapRelationships(subjectProfile["relationships"]);
  console.log(individual);
  return individual;
};

// export const mapRelationships = relationshipList => {
//   return relationshipList.map(relationship => {
//     return mapRelations(relationship);
//   });
// };

// export const mapRelations = relationShipJson => {
//   const individualRelationship = General.assignFields(
//     relationShipJson,
//     new IndividualRelationship(),
//     ["uuid"]
//   );
//   individualRelationship.relationship = new IndividualRelationshipType();
//   individualRelationship.individualB = new Individual();
//   individualRelationship.relationship.uuid = relationShipJson["relationshipTypeUuid"];
//   individualRelationship.relationship.individualBIsToARelation =
//     relationShipJson["individualBIsToARelation"];
//   individualRelationship.individualB.uuid = relationShipJson["individualBUuid"];
//   return individualRelationship;
// };

export const mapObservation = objservationList => {
  if (objservationList != null)
    return objservationList.map(observation => {
      return mapConcept(observation);
    });
};

export const mapConcept = observationJson => {
  const observation = new Observation();
  const concept = General.assignFields(observationJson.concept, new Concept(), ["uuid", "name"]);
  concept.datatype = observationJson.concept["dataType"];
  let valueuuid;
  if (Array.isArray(observationJson.value) && concept.datatype === "Coded") {
    valueuuid = [];
    observationJson.value.map(observation => {
      valueuuid.push(observation.uuid);
      storeDispachObservations(types.OBSERVATIONS_VALUE, observation);
    });
  } else if (concept.datatype === "Coded") {
    valueuuid = observationJson.value.uuid;
    storeDispachObservations(types.OBSERVATIONS_VALUE, observationJson.value);
  }

  const value = JSON.stringify(concept.getValueWrapperFor(valueuuid));
  observation.concept = concept;
  observation.valueJSON = value;
  return observation;
};
//1 Utility - generic mapping models object.
//2 UI bind - as pwer current structure.
//3 Common component - generic for all support.

export const mapProgram = subjectProgram => {
  let programIndividual = General.assignFields(subjectProgram, new Individual(), ["uuid"]);
  programIndividual.enrolments = mapEnrolment(subjectProgram.enrolments);
  console.log(programIndividual);
  return programIndividual;
};

export const mapEnrolment = enrolmentList => {
  if (enrolmentList != null)
    return enrolmentList.map(enrolments => {
      let programEnrolment = General.assignFields(enrolments, new ProgramEnrolment(), [
        "enrolmentDateTime",
        "programExitDateTime"
      ]);
      programEnrolment.observations = mapObservation(enrolments["observations"]);
      programEnrolment.encounters = mapProgramEncounters(enrolments["programEncounters"]);
      programEnrolment.program = mapOperationalProgramName(enrolments);
      return programEnrolment;
    });
};

export const mapProgramEncounters = programEncountersList => {
  if (programEncountersList != null)
    return programEncountersList.map(programEncounters => {
      return General.assignFields(programEncounters, new ProgramEncounter(), [
        "uuid",
        "name",
        "maxVisitDateTime",
        "earliestVisitDateTime",
        "encounterDateTime"
      ]);
    });
};

export const mapOperationalProgramName = operationalProgramName => {
  return General.assignFields(operationalProgramName, new Program(), ["operationalProgramName"]);
};
