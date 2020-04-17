package org.openchs.service;

import org.openchs.dao.ConceptRepository;
import org.openchs.dao.IndividualRepository;
import org.openchs.domain.*;
import org.openchs.domain.individualRelationship.IndividualRelation;
import org.openchs.domain.individualRelationship.IndividualRelationship;
import org.openchs.web.request.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.stereotype.Service;

import javax.validation.constraints.NotNull;
import java.util.*;
import java.util.stream.Collectors;

import static java.util.Collections.singletonList;


@Service
public class IndividualService {
    private final Logger logger;
    private final IndividualRepository individualRepository;
    private final ConceptRepository conceptRepository;
    private final ProjectionFactory projectionFactory;

    @Autowired
    public IndividualService(ConceptRepository conceptRepository, IndividualRepository individualRepository, ProjectionFactory projectionFactory) {
        this.projectionFactory = projectionFactory;
        logger = LoggerFactory.getLogger(this.getClass());
        this.conceptRepository = conceptRepository;
        this.individualRepository = individualRepository;
    }

    public  IndividualContract getSubjectEncounters(String individualUuid){
        Individual individual = individualRepository.findByUuid(individualUuid);
        if (individual == null)  {
            return null;
        }
        Set<EncounterContract> encountersContractList = constructEncounters(individual.getEncounters());
        IndividualContract individualContract = new IndividualContract();
        individualContract.setEncounters(encountersContractList);
        return individualContract;
    }

    public  IndividualContract getSubjectProgramEnrollment(String individualUuid){
        Individual individual = individualRepository.findByUuid(individualUuid);
        if (individual == null)  {
            return null;
        }
        List<EnrolmentContract> enrolmentContractList = constructEnrolmentsMetadata(individual);
        IndividualContract individualContract = new IndividualContract();
        individualContract.setUuid(individual.getUuid());
        individualContract.setEnrolments(enrolmentContractList);
        individualContract.setVoided(individual.isVoided());
        return individualContract;
    }

    public IndividualContract getSubjectInfo(String individualUuid) {
        Individual individual = individualRepository.findByUuid(individualUuid);
        IndividualContract individualContract = new IndividualContract();
        if (individual == null)  {
            return null;
        }

        List<ObservationContract> observationContractsList = constructObservations(individual.getObservations());
        List<RelationshipContract> relationshipContractList = constructRelationships(individual);
        List<EnrolmentContract> enrolmentContractList = constructEnrolments(individual);
        individualContract.setSubjectType(constructSubjectType(individual.getSubjectType()));
        individualContract.setObservations(observationContractsList);
        individualContract.setRelationships(relationshipContractList);
        individualContract.setEnrolments(enrolmentContractList);
        individualContract.setUuid(individual.getUuid());
        individualContract.setFirstName(individual.getFirstName());
        individualContract.setLastName(individual.getLastName());
        individualContract.setDateOfBirth(individual.getDateOfBirth());
        individualContract.setGender(individual.getGender().getName());
        individualContract.setGenderUUID(individual.getGender().getUuid());
        individualContract.setAddressLevel(individual.getAddressLevel().getTitle());
        individualContract.setRegistrationDate(individual.getRegistrationDate());
        individualContract.setAddressLevel(individual.getAddressLevel().getTitle());
        individualContract.setAddressLevelUUID(individual.getAddressLevel().getUuid());
        individualContract.setVoided(individual.isVoided());
        return individualContract;
    }

    private SubjectTypeContract constructSubjectType(SubjectType subjectType) {
        SubjectTypeContract subjectTypeContract = new SubjectTypeContract();
        subjectTypeContract.setUuid(subjectType.getUuid());
        subjectTypeContract.setName(subjectType.getName());
        subjectTypeContract.setVoided(subjectType.isVoided());
        return subjectTypeContract;
    }

    public List<EnrolmentContract> constructEnrolmentsMetadata(Individual individual) {
        return individual.getProgramEnrolments().stream().filter(x -> !x.isVoided()).map(programEnrolment -> {
            EnrolmentContract enrolmentContract = new EnrolmentContract();
            enrolmentContract.setUuid(programEnrolment.getUuid());
            enrolmentContract.setOperationalProgramName(programEnrolment.getProgram().getName());
            enrolmentContract.setEnrolmentDateTime(programEnrolment.getEnrolmentDateTime());
            enrolmentContract.setProgramExitDateTime(programEnrolment.getProgramExitDateTime());
            enrolmentContract.setProgramEncounters(constructProgramEncounters(programEnrolment.getProgramEncounters()));
            enrolmentContract.setVoided(programEnrolment.isVoided());
            List<ObservationContract> observationContractsList = constructObservations(programEnrolment.getObservations());
            enrolmentContract.setObservations(observationContractsList);
            if (programEnrolment.getProgramExitObservations() != null) {
                enrolmentContract.setExitObservations(constructObservations(programEnrolment.getProgramExitObservations()));
            }
            return enrolmentContract;
        }).collect(Collectors.toList());
    }

    public Set<EncounterContract> constructEncounters(Set<Encounter> encounters) {
        return encounters.stream().map(encounter -> {
            EncounterContract encountersContract = new EncounterContract();
            EncounterTypeContract encounterTypeContract = new EncounterTypeContract();
            encounterTypeContract.setName(encounter.getEncounterType().getOperationalEncounterTypeName());
            encountersContract.setUuid(encounter.getUuid());
            encountersContract.setName(encounter.getName());
            encountersContract.setEncounterType(encounterTypeContract);
            encountersContract.setEncounterDateTime(encounter.getEncounterDateTime());
            encountersContract.setEarliestVisitDateTime(encounter.getEarliestVisitDateTime());
            encountersContract.setMaxVisitDateTime(encounter.getMaxVisitDateTime());
            encountersContract.setVoided(encounter.isVoided());
            return encountersContract;
        }).collect(Collectors.toSet());
    }


    public Set <ProgramEncountersContract> constructProgramEncounters(Set<ProgramEncounter> programEncounters) {
        return programEncounters.stream().map(programEncounter -> {
            ProgramEncountersContract programEncountersContract = new ProgramEncountersContract();
            EncounterTypeContract encounterTypeContract = new EncounterTypeContract();
            encounterTypeContract.setName(programEncounter.getEncounterType().getName());
            programEncountersContract.setUuid(programEncounter.getUuid());
            programEncountersContract.setName(programEncounter.getName());
            programEncountersContract.setEncounterType(encounterTypeContract);
            programEncountersContract.setEncounterDateTime(programEncounter.getEncounterDateTime());
            programEncountersContract.setCancelDateTime(programEncounter.getCancelDateTime());
            programEncountersContract.setEarliestVisitDateTime(programEncounter.getEarliestVisitDateTime());
            programEncountersContract.setMaxVisitDateTime(programEncounter.getMaxVisitDateTime());
            programEncountersContract.setVoided(programEncounter.isVoided());
            return  programEncountersContract;
        }).collect(Collectors.toSet());
    }

    public List<EnrolmentContract> constructEnrolments(Individual individual) {

        return individual.getProgramEnrolments().stream().map(programEnrolment -> {
            EnrolmentContract enrolmentContract = new EnrolmentContract();
            enrolmentContract.setUuid(programEnrolment.getUuid());
            enrolmentContract.setOperationalProgramName(programEnrolment.getProgram().getName());
            enrolmentContract.setEnrolmentDateTime(programEnrolment.getEnrolmentDateTime());
            enrolmentContract.setProgramExitDateTime(programEnrolment.getProgramExitDateTime());
            enrolmentContract.setVoided(programEnrolment.isVoided());
            return enrolmentContract;
        }).collect(Collectors.toList());
    }

    public List<RelationshipContract> constructRelationships(Individual individual) {
        List<RelationshipContract> relationshipContractFromSelfToOthers = individual.getRelationshipsFromSelfToOthers().stream().filter(individualRelationship -> !individualRelationship.isVoided()).map(individualRelationship -> {
            Individual individualB = individualRelationship.getIndividualB();
            IndividualRelation individualRelation = individualRelationship.getRelationship().getIndividualBIsToA();
            return constructCommonRelationship(individualRelationship,individualB,individualRelation,individualRelationship.getRelationship().getIndividualAIsToB());
        }).collect(Collectors.toList());

        List<RelationshipContract> relationshipContractFromOthersToSelf = individual.getRelationshipsFromOthersToSelf().stream().filter(individualRelationship -> !individualRelationship.isVoided()).map(individualRelationship -> {
            Individual individualA = individualRelationship.getIndividuala();
            IndividualRelation individualRelation = individualRelationship.getRelationship().getIndividualAIsToB();
            return constructCommonRelationship(individualRelationship,individualA,individualRelation,individualRelationship.getRelationship().getIndividualBIsToA());
        }).collect(Collectors.toList());
        relationshipContractFromSelfToOthers.addAll(relationshipContractFromOthersToSelf);
        return relationshipContractFromSelfToOthers;
    }

    private RelationshipContract constructCommonRelationship(IndividualRelationship individualRelationship,Individual individual,IndividualRelation individualRelation,IndividualRelation individualAIsToBRelation) {
        RelationshipContract relationshipContract = new RelationshipContract();
        IndividualContract individualBContract = new IndividualContract();
        individualBContract.setUuid(individual.getUuid());
        individualBContract.setFirstName(individual.getFirstName());
        individualBContract.setLastName(individual.getLastName());
        individualBContract.setDateOfBirth(individual.getDateOfBirth());
        relationshipContract.setIndividualB(individualBContract);

        IndividualRelationshipTypeContract individualRelationshipTypeContract = new IndividualRelationshipTypeContract();
        individualRelationshipTypeContract.setUuid(individualRelationship.getRelationship().getUuid());
        individualRelationshipTypeContract.getIndividualBIsToARelation().setName(individualRelation.getName());
        individualRelationshipTypeContract.getIndividualAIsToBRelation().setName(individualAIsToBRelation.getName());
        relationshipContract.setRelationshipType(individualRelationshipTypeContract);
        relationshipContract.setUuid(individualRelationship.getUuid());
        relationshipContract.setEnterDateTime(individualRelationship.getEnterDateTime());
        relationshipContract.setExitDateTime(individualRelationship.getExitDateTime());
        relationshipContract.setVoided(individualRelationship.isVoided());
        if (individualRelationship.getExitObservations() != null) {
            relationshipContract.setExitObservations(constructObservations(individualRelationship.getExitObservations()));
        }
        return relationshipContract;
    }

    public List<ObservationContract> constructObservations(@NotNull ObservationCollection observationCollection) {
        return observationCollection.entrySet().stream().map(entry -> {
            ObservationContract observationContract = new ObservationContract();
            Concept questionConcept = conceptRepository.findByUuid(entry.getKey());
            ConceptContract conceptContract = ConceptContract.create(questionConcept);
            observationContract.setConcept(conceptContract);
            Object value = entry.getValue();
            if (questionConcept.getDataType().equalsIgnoreCase(ConceptDataType.Coded.toString())) {
                List<String> answers = value instanceof List ? (List<String>) value : singletonList(value.toString());
                if (value instanceof List) {
                    List<ConceptContract> answerConceptList = questionConcept.getConceptAnswers().stream()
                        .filter(it ->
                                answers.contains(it.getAnswerConcept().getUuid())
                        ).map(it -> {
                            ConceptContract cc = ConceptContract.create(it.getAnswerConcept());
                            cc.setAbnormal(it.isAbnormal());
                            return cc;
                        }).collect(Collectors.toList());
                    observationContract.setValue(answerConceptList);
                } else {
                    ConceptAnswer conceptAnswer = questionConcept.getConceptAnswers().stream()
                    .filter(it -> value.equals(it.getAnswerConcept().getUuid())).findFirst().orElse(null);
                    if(conceptAnswer != null) {
                        ConceptContract cc = ConceptContract.create(conceptAnswer.getAnswerConcept());
                        cc.setAbnormal(conceptAnswer.isAbnormal());
                        observationContract.setValue(cc);
                    }
                    
                }
            } else {
                observationContract.setValue(value);
            }
            return observationContract;
        }).collect(Collectors.toList());
    }
}
