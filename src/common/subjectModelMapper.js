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
  IndividualRelationshipType,
  IndividualRelation
} from "avni-models";
import { types } from "../common/store/commonReduxStoreReducer";

export const mapIndividual = individualDetails => {
  return General.assignFields(
    individualDetails,
    new Individual(),
    ["uuid", "firstName", "lastName", "dateOfBirth", "gender", "lowestAddressLevel"],
    ["registrationDate"]
  );
};

export const mapProfile = subjectProfile => {
  let individual = mapIndividual(subjectProfile);
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
  individualRelationship.relationship = mapIndividualRelationshipType(
    relationShipJson["relationshipType"]
  );
  individualRelationship.individualB = mapIndividual(relationShipJson["individualB"]);
  return individualRelationship;
};

export const mapIndividualRelationshipType = relationShipType => {
  if (relationShipType != null) {
    const individualRelationShipType = General.assignFields(
      relationShipType,
      new IndividualRelationshipType(),
      ["uuid"]
    );
    individualRelationShipType.individualAIsToBRelation = mapIndividualRelation(
      relationShipType["individualAIsToBRelation"]
    );
    individualRelationShipType.individualBIsToARelation = mapIndividualRelation(
      relationShipType["individualBIsToARelation"]
    );
    return individualRelationShipType;
  }
};

export const mapIndividualRelation = individualRelation => {
  if (individualRelation != null) {
    return General.assignFields(individualRelation, new IndividualRelation(), ["name"]);
  }
};

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
  } else {
    valueuuid = observationJson.value;
  }

  const value = JSON.stringify(concept.getValueWrapperFor(valueuuid));
  observation.concept = concept;
  observation.valueJSON = value;
  return observation;
};

// program Tab subject Dashboard

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
