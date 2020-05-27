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
    ["uuid", "firstName", "lastName"],
    ["dateOfBirth", "registrationDate"]
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
  addressLevel.type = individualDetails.addressLevelTypeName;
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

export const mapProgramEnrolment = json => {
  const programEnrolment = new ProgramEnrolment();
  programEnrolment.uuid = json.uuid;
  if (json.enrolmentDateTime) programEnrolment.enrolmentDateTime = new Date(json.enrolmentDateTime);
  if (json.programExitDateTime)
    programEnrolment.programExitDateTime = new Date(json.programExitDateTime);
  programEnrolment.programExitObservations = mapObservation(json.exitObservations);
  programEnrolment.observations = mapObservation(json.observations);
  const program = new Program();
  program.uuid = json.programUuid;
  programEnrolment.program = program;
  programEnrolment.voided = false;
  return programEnrolment;
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
    programIndividual.exitObservations = mapEnrolment(subjectProgram.exitObservations);
    return programIndividual;
  }
};
export const mapEnrolment = enrolmentList => {
  if (enrolmentList)
    return enrolmentList.map(enrolment => {
      let programEnrolment = General.assignFields(
        enrolment,
        new ProgramEnrolment(),
        ["uuid"],
        ["programExitDateTime", "enrolmentDateTime"]
      );
      programEnrolment.observations = mapObservation(enrolment["observations"]);
      programEnrolment.encounters = mapProgramEncounters(enrolment["programEncounters"]);
      programEnrolment.exitObservations = mapObservation(enrolment["exitObservations"]);
      programEnrolment.program = mapOperationalProgram(enrolment);
      programEnrolment.uuid = enrolment.uuid;
      programEnrolment.id = enrolment.id;
      return programEnrolment;
    });
};

//To get list Program Encounters
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

//To get Program Encounter with observations
export const mapProgramEncounter = programEncounter => {
  if (programEncounter) {
    const programEncounterObj = General.assignFields(
      programEncounter,
      new ProgramEncounter(),
      ["uuid", "name"],
      ["maxVisitDateTime", "earliestVisitDateTime", "encounterDateTime"]
    );
    programEncounterObj.encounterType = mapEncounterType(programEncounter["encounterType"]);
    programEncounterObj.observations = mapObservation(programEncounter["observations"]);
    return programEncounterObj;
  }
};

export const mapOperationalProgram = enrolment => {
  const operationalProgram = General.assignFields(enrolment, new Program(), [
    "operationalProgramName"
  ]);
  operationalProgram.uuid = enrolment.programUuid;
  return operationalProgram;
};

export const mapEncounterType = encounterType => {
  return General.assignFields(encounterType, new EncounterType(), ["name", "uuid"]);
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

export const mapEncounter = encounterDetails => {
  if (encounterDetails) {
    const programEnconter = General.assignFields(
      encounterDetails,
      new ProgramEncounter(),
      ["uuid", "name"],
      ["earliestVisitDateTime", "maxVisitDateTime", "encounterDateTime"]
    );
    programEnconter.encounterType = mapEncounterType(encounterDetails.encounterType);
    programEnconter.observations = mapObservation(encounterDetails["observations"]);
    programEnconter.subjectUuid = encounterDetails["subjectUUID"];
    programEnconter.enrolmentUuid = encounterDetails["enrolmentUUID"];
    return programEnconter;
  }
};
