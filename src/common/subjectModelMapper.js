import { store } from "../../src/common/store/createStore";

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
  IndividualRelation,
  Encounter,
  EncounterType,
  Gender,
  AddressLevel,
  SubjectType
} from "avni-models";
import { types } from "../common/store/conceptReducer";

// subject Dashboard common functionality
export const mapIndividual = individualDetails => {
  const individual = General.assignFields(
    individualDetails,
    new Individual(),
    ["uuid", "firstName", "lastName", "dateOfBirth"],
    ["registrationDate"]
  );
  const gender = new Gender();
  gender.name = individualDetails.gender;
  gender.uuid = individualDetails.genderUUID;
  individual.gender = gender;

  const subjectType = new SubjectType();
  subjectType.uuid = individualDetails.subjectType.uuid;
  subjectType.name = individualDetails.subjectType.name;
  individual.subjectType = subjectType;

  const addressLevel = new AddressLevel();
  addressLevel.uuid = individualDetails.addressLevelUUID;
  addressLevel.name = individualDetails.addressLevel;
  individual.lowestAddressLevel = addressLevel;

  return individual;
};
export const mapObservation = objservationList => {
  if (objservationList)
    return objservationList.map(observation => {
      return mapConcept(observation);
    });
};
// included redux store functionality
export const mapConcept = observationJson => {
  if (observationJson) {
    const observation = new Observation();
    const concept = General.assignFields(observationJson.concept, new Concept(), ["uuid", "name"]);
    concept.datatype = observationJson.concept["dataType"];
    let valueuuid;
    let isAbnormalValue;
    if (Array.isArray(observationJson.value) && concept.datatype === "Coded") {
      valueuuid = [];

      observationJson.value.forEach(observation => {
        valueuuid.push(observation.uuid);
        isAbnormalValue = observation.abnormal;
        store.dispatch({ type: types.ADD_CONCEPT, value: observation });
      });
    } else if (concept.datatype === "Coded") {
      valueuuid = observationJson.value.uuid;
      isAbnormalValue = observationJson.value.abnormal;
      store.dispatch({ type: types.ADD_CONCEPT, value: observationJson.value });
    } else {
      valueuuid = observationJson.value;
    }
    const value = concept.getValueWrapperFor(valueuuid);
    observation.concept = concept;
    observation.valueJSON = value;
    observation.abnormal = isAbnormalValue;
    return observation;
  }
};

//subject Dashboard profile Tab
export const mapProfile = subjectProfile => {
  if (subjectProfile) {
    let individual = mapIndividual(subjectProfile);
    individual.observations = mapObservation(subjectProfile["observations"]);
    individual.relationships = mapRelationships(subjectProfile["relationships"]);
    return individual;
  }
};

export const mapRelationships = relationshipList => {
  if (relationshipList) {
    return relationshipList.map(relationship => {
      return mapRelations(relationship);
    });
  }
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
  if (relationShipType) {
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
  if (individualRelation) {
    return General.assignFields(individualRelation, new IndividualRelation(), ["name"]);
  }
};

// program Tab subject Dashboard
export const mapProgram = subjectProgram => {
  if (subjectProgram) {
    let programIndividual = General.assignFields(subjectProgram, new Individual(), ["uuid"]);
    programIndividual.enrolments = mapEnrolment(subjectProgram.enrolments);
    return programIndividual;
  }
};
export const mapEnrolment = enrolmentList => {
  if (enrolmentList)
    return enrolmentList.map(enrolments => {
      let programEnrolment = General.assignFields(
        enrolments,
        new ProgramEnrolment(),
        [],
        ["programExitDateTime", "enrolmentDateTime"]
      );
      programEnrolment.observations = mapObservation(enrolments["observations"]);
      programEnrolment.encounters = mapProgramEncounters(enrolments["programEncounters"]);
      programEnrolment.program = mapOperationalProgramName(enrolments);
      return programEnrolment;
    });
};

export const mapProgramEncounters = programEncountersList => {
  if (programEncountersList)
    return programEncountersList.map(programEncounters => {
      const programEnconter = General.assignFields(
        programEncounters,
        new ProgramEncounter(),
        ["uuid", "name"],
        ["maxVisitDateTime", "earliestVisitDateTime", "encounterDateTime"]
      );
      programEnconter.encounterType = mapEncounterType(programEncounters["encounterType"]);
      return programEnconter;
    });
};

export const mapOperationalProgramName = operationalProgramName => {
  return General.assignFields(operationalProgramName, new Program(), ["operationalProgramName"]);
};

export const mapEncounterType = encounterType => {
  return General.assignFields(encounterType, new EncounterType(), ["name"]);
};

// general tab subject Dashbord
export const mapGeneral = subjectGeneral => {
  if (subjectGeneral && subjectGeneral.encounters) {
    return subjectGeneral.encounters.map(encounters => {
      let generalEncounter = General.assignFields(
        encounters,
        new Encounter(),
        ["uuid"],
        ["encounterDateTime", "earliestVisitDateTime", "maxVisitDateTime"]
      );
      generalEncounter.encounterType = mapEncounterType(encounters.encounterType);
      return generalEncounter;
    });
  }
};
