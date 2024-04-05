import {
  AddressLevel,
  Concept,
  ConceptAnswer,
  Encounter,
  EncounterType,
  Gender,
  GroupRole,
  GroupSubject,
  Individual,
  IndividualRelation,
  IndividualRelationship,
  IndividualRelationshipType,
  ModelGeneral as General,
  Observation,
  Program,
  ProgramEncounter,
  ProgramEnrolment,
  QuestionGroup
} from "avni-models";
import _, { isNil, map } from "lodash";
import { conceptService } from "dataEntryApp/services/ConceptService";
import { subjectService } from "../dataEntryApp/services/SubjectService";
import { addressLevelService } from "../dataEntryApp/services/AddressLevelService";
import { mapSubjectType } from "./adapters";
import { RepeatableQuestionGroup } from "openchs-models";

export const mapIndividual = individualDetails => {
  const individual = General.assignFields(
    individualDetails,
    new Individual(),
    Individual.directCopyFields,
    Individual.dateFields
  );
  individual.name = Individual.getFullName(individual);
  const gender = new Gender();
  gender.name = individualDetails.gender;
  gender.uuid = individualDetails.genderUUID;
  individual.gender = gender;

  individual.subjectType = mapSubjectType(individualDetails.subjectType);

  const addressLevel = new AddressLevel();
  addressLevel.uuid = individualDetails.addressLevelUUID;
  addressLevel.name = individualDetails.addressLevel;
  addressLevel.type = individualDetails.addressLevelTypeName;
  addressLevel.titleLineage = individualDetails.addressLevelLineage;
  individual.lowestAddressLevel = addressLevel;

  return individual;
};

export function mapObservations(observations) {
  if (observations)
    return observations.map(observation => {
      return mapObservation(observation);
    });
}

function getAnswers(answersJson) {
  return map(answersJson, answerJson => {
    const conceptAnswer = new ConceptAnswer();
    conceptAnswer.answerOrder = answerJson.order;
    conceptAnswer.abnormal = answerJson.abnormal;
    conceptAnswer.unique = answerJson.unique;
    conceptAnswer.voided = !!answerJson.voided;
    conceptAnswer.concept = mapConcept(answerJson);
    return conceptAnswer;
  });
}

export const mapConcept = conceptJson => {
  const concept = General.assignFields(conceptJson, new Concept(), [
    "uuid",
    "name",
    "lowAbsolute",
    "lowNormal"
  ]);
  concept.datatype = conceptJson["dataType"];
  concept.hiNormal = conceptJson["highNormal"];
  concept.hiAbsolute = conceptJson["highAbsolute"];
  concept.answers = getAnswers(conceptJson["answers"]);
  conceptService.addConcept(concept);
  return concept;
};

function looksLikeRepeatableQuestionGroupValue(value) {
  return _.isArrayLike(value) && value.length > 0 && _.isArrayLike(value[0]);
}

export function mapObservation(observationJson) {
  if (observationJson) {
    const observation = new Observation();
    const concept = mapConcept(observationJson.concept);

    observationJson.subjects &&
      observationJson.subjects.forEach(subject => {
        subjectService.addSubject(subject);
      });
    observationJson.location && addressLevelService.addAddressLevel(observationJson.location);
    let value;
    if (concept.isQuestionGroup()) {
      if (looksLikeRepeatableQuestionGroupValue(observationJson.value)) {
        //RepeatableQuestionGroup
        const repeatableQuestionGroupObservations = _.map(
          observationJson.value,
          qgObs => new QuestionGroup(mapObservations(qgObs))
        );
        value = new RepeatableQuestionGroup(repeatableQuestionGroupObservations);
      } else {
        //QuestionGroup
        const questionGroupObservations = mapObservations(observationJson.value);
        value = new QuestionGroup(questionGroupObservations);
      }
    } else {
      value = concept.getValueWrapperFor(observationJson.value);
    }
    observation.concept = concept;
    observation.valueJSON = value;
    return observation;
  }
}

//subject Dashboard profile Tab
export const mapProfile = subjectProfile => {
  if (subjectProfile) {
    let individual = mapIndividual(subjectProfile);
    individual.observations = mapObservations(subjectProfile["observations"]);
    individual.relationships = mapRelationships(subjectProfile["relationships"]);
    individual.memberships = mapMemberships(subjectProfile["memberships"]);
    individual.roles = mapRoles(subjectProfile["roles"]);
    return individual;
  }
};

export function mapProgramEnrolment(json, subject) {
  const programEnrolment = new ProgramEnrolment();
  programEnrolment.uuid = json.uuid;
  if (json.enrolmentDateTime) programEnrolment.enrolmentDateTime = new Date(json.enrolmentDateTime);
  if (json.programExitDateTime)
    programEnrolment.programExitDateTime = new Date(json.programExitDateTime);
  programEnrolment.programExitObservations = mapObservations(json.exitObservations);
  programEnrolment.observations = mapObservations(json.observations) || [];
  const program = new Program();
  program.uuid = json.programUuid;
  program.name = json.operationalProgramName;
  programEnrolment.program = program;
  programEnrolment.voided = false;
  if (subject) programEnrolment.individual = subject;
  if (!isNil(json.programEncounters)) {
    programEnrolment.encounters = map(json.programEncounters, programEncounter =>
      mapProgramEncounter(programEncounter)
    );
  }
  return programEnrolment;
}

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
    ["uuid", "id", "exitDateTime", "enterDateTime"]
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

export const mapMemberships = memberships => {
  if (memberships) {
    return memberships.map(membership => {
      let groupSubject = GroupSubject.createEmptyInstance(membership.uuid);
      groupSubject.groupSubject.uuid = membership["groupSubjectUUID"];
      groupSubject.groupSubject.name = membership["groupSubjectName"];
      groupSubject.groupRole = mapGroupRole({
        uuid: membership["groupRoleUUID"],
        role: membership["groupRoleName"]
      });
      groupSubject.groupSubject.subjectType = membership["groupSubjectSubjectType"];
      return groupSubject;
    });
  }
};

export const mapGroupRole = groupRoleData => {
  if (groupRoleData) {
    let groupRole = General.assignFields(groupRoleData, new GroupRole(), [
      "uuid",
      "role",
      "maximumNumberOfMembers",
      "minimumNumberOfMembers"
    ]);
    groupRole.memberSubjectTypeUUID = groupRoleData.memberSubjectTypeUUID;
    return groupRole;
  }
};

export const mapRoles = groupRoles => {
  if (groupRoles) {
    return groupRoles.map(groupRole => {
      return mapGroupRole(groupRole);
    });
  }
};

export const mapGroupMembers = groupSubjects => {
  if (groupSubjects) {
    return groupSubjects.map(groupSubject => {
      let mappedGroupSubject = new GroupSubject();
      mappedGroupSubject.uuid = groupSubject.uuid;
      mappedGroupSubject.memberSubject = mapIndividual(groupSubject.member);
      mappedGroupSubject.groupRole = mapGroupRole(groupSubject.role);
      mappedGroupSubject.encounterMetadata = groupSubject.encounterMetadata;
      return mappedGroupSubject;
    });
  }
};

// program Tab subject Dashboard
export const mapProgram = subjectProgram => {
  if (subjectProgram) {
    let programIndividual = General.assignFields(subjectProgram, new Individual(), ["uuid"]);
    programIndividual.enrolments = mapEnrolments(subjectProgram.enrolments);
    programIndividual.exitObservations = mapEnrolments(subjectProgram.exitObservations);
    return programIndividual;
  }
};
export const mapEnrolments = enrolmentList => {
  if (enrolmentList)
    return enrolmentList.map(enrolment => {
      let programEnrolment = General.assignFields(
        enrolment,
        new ProgramEnrolment(),
        ["uuid"],
        ["programExitDateTime", "enrolmentDateTime"]
      );
      programEnrolment.observations = mapObservations(enrolment["observations"]);
      programEnrolment.encounters = mapProgramEncounters(enrolment["programEncounters"]);
      programEnrolment.exitObservations = mapObservations(enrolment["exitObservations"]);
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
      const programEncounter = General.assignFields(
        programEncounters,
        new ProgramEncounter(),
        ["uuid", "name"],
        ["maxVisitDateTime", "earliestVisitDateTime", "encounterDateTime", "cancelDateTime"]
      );
      programEncounter.encounterType = mapEncounterType(programEncounters["encounterType"]);
      return programEncounter;
    });
};

export const mapOperationalProgram = enrolment => {
  const operationalProgram = General.assignFields(enrolment, new Program(), [
    "operationalProgramName"
  ]);
  operationalProgram.name = enrolment.programName;
  operationalProgram.uuid = enrolment.programUuid;
  return operationalProgram;
};

export const mapEncounterType = encounterType => {
  return General.assignFields(encounterType, new EncounterType(), ["name", "uuid"]);
};

// general tab subject Dashboard
export const mapGeneral = subjectGeneral => {
  if (subjectGeneral && subjectGeneral.encounters) {
    return subjectGeneral.encounters.map(encounters => {
      let generalEncounter = General.assignFields(
        encounters,
        new Encounter(),
        ["uuid", "name"],
        ["encounterDateTime", "earliestVisitDateTime", "maxVisitDateTime", "cancelDateTime"]
      );
      generalEncounter.encounterType = mapEncounterType(encounters.encounterType);
      return generalEncounter;
    });
  }
};

//To get Program Encounter with observations
export const mapProgramEncounter = (
  programEncounter,
  observations = programEncounter["observations"]
) => {
  if (programEncounter) {
    const programEncounterObj = General.assignFields(
      programEncounter,
      new ProgramEncounter(),
      ["uuid", "name"],
      ["maxVisitDateTime", "earliestVisitDateTime", "encounterDateTime", "cancelDateTime"]
    );
    programEncounterObj.encounterType = mapEncounterType(programEncounter["encounterType"]);
    programEncounterObj.observations = mapObservations(observations);
    programEncounterObj.cancelObservations = mapObservations(
      programEncounter["cancelObservations"]
    );
    programEncounterObj.subjectUuid = programEncounter["subjectUUID"];
    programEncounterObj.enrolmentUuid = programEncounter["enrolmentUUID"];
    return programEncounterObj;
  }
};

export const mapEncounter = (encounterDetails, observations = encounterDetails["observations"]) => {
  if (encounterDetails) {
    const encounter = General.assignFields(
      encounterDetails,
      new Encounter(),
      ["uuid", "name"],
      ["earliestVisitDateTime", "maxVisitDateTime", "encounterDateTime", "cancelDateTime"]
    );
    encounter.encounterType = mapEncounterType(encounterDetails.encounterType);
    encounter.observations = mapObservations(observations);
    encounter.cancelObservations = mapObservations(encounterDetails["cancelObservations"]);
    encounter.subjectUuid = encounterDetails["subjectUUID"];
    return encounter;
  }
};
