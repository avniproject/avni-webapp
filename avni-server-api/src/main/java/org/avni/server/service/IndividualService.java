package org.avni.server.service;

import org.avni.messaging.domain.EntityType;
import org.avni.server.application.*;
import org.avni.server.common.Messageable;
import org.avni.server.dao.*;
import org.avni.server.domain.*;
import org.avni.server.domain.individualRelationship.IndividualRelation;
import org.avni.server.domain.individualRelationship.IndividualRelationship;
import org.avni.server.framework.security.UserContextHolder;
import org.avni.server.util.BadRequestError;
import org.avni.server.util.S;
import org.avni.server.web.request.*;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;


@Service
public class IndividualService implements ScopeAwareService {
    private final IndividualRepository individualRepository;
    private final ObservationService observationService;
    private final GroupSubjectRepository groupSubjectRepository;
    private final ConceptRepository conceptRepository;
    private final GroupRoleRepository groupRoleRepository;
    private final SubjectTypeRepository subjectTypeRepository;
    private final AddressLevelService addressLevelService;

    @Autowired
    public IndividualService(IndividualRepository individualRepository, ObservationService observationService, GroupSubjectRepository groupSubjectRepository, ConceptRepository conceptRepository, GroupRoleRepository groupRoleRepository, SubjectTypeRepository subjectTypeRepository, AddressLevelService addressLevelService) {
        this.individualRepository = individualRepository;
        this.observationService = observationService;
        this.groupSubjectRepository = groupSubjectRepository;
        this.conceptRepository = conceptRepository;
        this.groupRoleRepository = groupRoleRepository;
        this.subjectTypeRepository = subjectTypeRepository;
        this.addressLevelService = addressLevelService;
    }

    public Individual findByUuid(String uuid) {
        return individualRepository.findByUuid(uuid);
    }

    public Individual findById(Long id) {
      return individualRepository.findEntity(id);
    }

    public IndividualContract getSubjectEncounters(String individualUuid) {
        Individual individual = individualRepository.findByUuid(individualUuid);
        if (individual == null) {
            return null;
        }
        Set<EncounterContract> encountersContractList = constructEncounters(individual.nonVoidedEncounters());
        IndividualContract individualContract = new IndividualContract();
        individualContract.setEncounters(encountersContractList);
        return individualContract;
    }

    public IndividualContract getSubjectProgramEnrollment(String individualUuid) {
        Individual individual = individualRepository.findByUuid(individualUuid);
        if (individual == null) {
            return null;
        }
        List<EnrolmentContract> enrolmentContractList = constructEnrolmentsMetadata(individual);
        IndividualContract individualContract = new IndividualContract();
        individualContract.setUuid(individual.getUuid());
        individualContract.setId(individual.getId());
        individualContract.setEnrolments(enrolmentContractList);
        individualContract.setVoided(individual.isVoided());
        return individualContract;
    }

    public IndividualContract getSubjectInfo(String individualUuid) {
        Individual individual = individualRepository.findByUuid(individualUuid);
        IndividualContract individualContract = new IndividualContract();
        if (individual == null) {
            return null;
        }

        List<ObservationContract> observationContractsList = observationService.constructObservations(individual.getObservations());
        List<RelationshipContract> relationshipContractList = constructRelationships(individual);
        List<EnrolmentContract> enrolmentContractList = constructEnrolments(individual);
        List<GroupSubject> groupSubjects = groupSubjectRepository.findAllByMemberSubjectAndGroupRoleIsVoidedFalseAndIsVoidedFalse(individual);
        List<GroupRole> groupRoles = groupRoleRepository.findByGroupSubjectType_IdAndIsVoidedFalse(individual.getSubjectType().getId());
        individualContract.setId(individual.getId());
        individualContract.setSubjectType(SubjectTypeContract.fromSubjectType(individual.getSubjectType()));
        individualContract.setObservations(observationContractsList);
        individualContract.setRelationships(relationshipContractList);
        individualContract.setEnrolments(enrolmentContractList);
        individualContract.setUuid(individual.getUuid());
        individualContract.setFirstName(individual.getFirstName());
        individualContract.setMiddleName(individual.getMiddleName());
        individualContract.setLastName(individual.getLastName());
        if (null != individual.getProfilePicture()
                && individual.getSubjectType().isAllowProfilePicture())
            individualContract.setProfilePicture(individual.getProfilePicture());
        if (null != individual.getDateOfBirth())
            individualContract.setDateOfBirth(individual.getDateOfBirth());
        if (null != individual.getGender()) {
            individualContract.setGender(individual.getGender().getName());
            individualContract.setGenderUUID(individual.getGender().getUuid());
        }
        if (groupSubjects != null) {
            individualContract.setMemberships(groupSubjects.stream().map(GroupSubjectContract::fromEntity).collect(Collectors.toList()));
        }
        if (groupRoles != null) {
            individualContract.setRoles(groupRoles.stream().map(GroupRoleContract::fromEntity).collect(Collectors.toList()));
        }
        individualContract.setRegistrationDate(individual.getRegistrationDate());
        individualContract.setVoided(individual.isVoided());
        AddressLevel addressLevel = individual.getAddressLevel();
        if (addressLevel != null) {
            individualContract.setAddressLevel(addressLevel.getTitle());
            individualContract.setAddressLevelLineage(addressLevelService.getTitleLineage(addressLevel));
            individualContract.setAddressLevelUUID(addressLevel.getUuid());
            individualContract.setAddressLevelTypeName(addressLevel.getType().getName());
            individualContract.setAddressLevelTypeId(addressLevel.getType().getId());
        }
        return individualContract;
    }

    public List<EnrolmentContract> constructEnrolmentsMetadata(Individual individual) {
        return individual.getProgramEnrolments().stream().filter(x -> !x.isVoided()).map(programEnrolment -> {
            EnrolmentContract enrolmentContract = new EnrolmentContract();
            enrolmentContract.setUuid(programEnrolment.getUuid());
            enrolmentContract.setId(programEnrolment.getId());
            enrolmentContract.setProgramUuid(programEnrolment.getProgram().getUuid());
            enrolmentContract.setOperationalProgramName(programEnrolment.getProgram().getOperationalProgramName());
            enrolmentContract.setEnrolmentDateTime(programEnrolment.getEnrolmentDateTime());
            enrolmentContract.setProgramExitDateTime(programEnrolment.getProgramExitDateTime());
            enrolmentContract.setProgramEncounters(constructProgramEncounters(programEnrolment.nonVoidedEncounters()));
            enrolmentContract.setVoided(programEnrolment.isVoided());
            enrolmentContract.setProgramName(programEnrolment.getProgram().getName());
            List<ObservationContract> observationContractsList = observationService.constructObservations(programEnrolment.getObservations());
            enrolmentContract.setObservations(observationContractsList);
            if (programEnrolment.getProgramExitObservations() != null) {
                enrolmentContract.setExitObservations(observationService.constructObservations(programEnrolment.getProgramExitObservations()));
            }
            return enrolmentContract;
        }).collect(Collectors.toList());
    }

    public Set<EncounterContract> constructEncounters(Stream<Encounter> encounters) {
        return encounters.map(encounter -> {
            EncounterContract encounterContract = new EncounterContract();
            EncounterTypeContract encounterTypeContract = new EncounterTypeContract();
            encounterTypeContract.setUuid(encounter.getEncounterType().getUuid());
            encounterTypeContract.setName(encounter.getEncounterType().getOperationalEncounterTypeName());
            encounterContract.setId(encounter.getId());
            encounterContract.setUuid(encounter.getUuid());
            encounterContract.setName(encounter.getName());
            encounterContract.setEncounterType(encounterTypeContract);
            encounterContract.setEncounterDateTime(encounter.getEncounterDateTime());
            encounterContract.setEarliestVisitDateTime(encounter.getEarliestVisitDateTime());
            encounterContract.setMaxVisitDateTime(encounter.getMaxVisitDateTime());
            encounterContract.setCancelDateTime(encounter.getCancelDateTime());
            encounterContract.setVoided(encounter.isVoided());
            return encounterContract;
        }).collect(Collectors.toSet());
    }


    public Set<ProgramEncountersContract> constructProgramEncounters(Stream<ProgramEncounter> programEncounters) {
        return programEncounters.map(programEncounter -> {
            ProgramEncountersContract programEncountersContract = new ProgramEncountersContract();
            EncounterTypeContract encounterTypeContract =
                    EncounterTypeContract.fromEncounterType(programEncounter.getEncounterType());
            programEncountersContract.setUuid(programEncounter.getUuid());
            programEncountersContract.setId(programEncounter.getId());
            programEncountersContract.setName(programEncounter.getName());
            programEncountersContract.setEncounterType(encounterTypeContract);
            programEncountersContract.setEncounterDateTime(programEncounter.getEncounterDateTime());
            programEncountersContract.setCancelDateTime(programEncounter.getCancelDateTime());
            programEncountersContract.setEarliestVisitDateTime(programEncounter.getEarliestVisitDateTime());
            programEncountersContract.setMaxVisitDateTime(programEncounter.getMaxVisitDateTime());
            programEncountersContract.setVoided(programEncounter.isVoided());
            return programEncountersContract;
        }).collect(Collectors.toSet());
    }

    public List<EnrolmentContract> constructEnrolments(Individual individual) {

        return individual.getProgramEnrolments().stream().map(programEnrolment -> {
            EnrolmentContract enrolmentContract = new EnrolmentContract();
            enrolmentContract.setId(programEnrolment.getId());
            enrolmentContract.setUuid(programEnrolment.getUuid());
            enrolmentContract.setOperationalProgramName(programEnrolment.getProgram().getOperationalProgramName());
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
            return constructCommonRelationship(individualRelationship, individualB, individualRelation, individualRelationship.getRelationship().getIndividualAIsToB());
        }).collect(Collectors.toList());

        List<RelationshipContract> relationshipContractFromOthersToSelf = individual.getRelationshipsFromOthersToSelf().stream().filter(individualRelationship -> !individualRelationship.isVoided()).map(individualRelationship -> {
            Individual individualA = individualRelationship.getIndividuala();
            IndividualRelation individualRelation = individualRelationship.getRelationship().getIndividualAIsToB();
            return constructCommonRelationship(individualRelationship, individualA, individualRelation, individualRelationship.getRelationship().getIndividualBIsToA());
        }).collect(Collectors.toList());
        relationshipContractFromSelfToOthers.addAll(relationshipContractFromOthersToSelf);
        return relationshipContractFromSelfToOthers;
    }

    private RelationshipContract constructCommonRelationship(IndividualRelationship individualRelationship, Individual individual, IndividualRelation individualRelation, IndividualRelation individualAIsToBRelation) {
        RelationshipContract relationshipContract = new RelationshipContract();
        IndividualContract individualBContract = new IndividualContract();
        individualBContract.setUuid(individual.getUuid());
        individualBContract.setFirstName(individual.getFirstName());
        individualBContract.setMiddleName(individual.getMiddleName());
        individualBContract.setLastName(individual.getLastName());
        if (individual.getSubjectType().isAllowProfilePicture()) {
            individualBContract.setProfilePicture(individual.getProfilePicture());
        }
        individualBContract.setDateOfBirth(individual.getDateOfBirth());
        individualBContract.setSubjectType(SubjectTypeContract.fromSubjectType(individual.getSubjectType()));
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
            relationshipContract.setExitObservations(observationService.constructObservations(individualRelationship.getExitObservations()));
        }
        if (null != individualRelationship && null != individualRelationship.getId()) {
            relationshipContract.setId(individualRelationship.getId());
        }
        if (null != individualRelationship && null != individualRelationship.getId())
            individualRelationshipTypeContract.setId(individualRelationship.getRelationship().getId());
        return relationshipContract;
    }

    public GroupSubjectContractWeb createGroupSubjectContractWeb(String uuid, Individual member, GroupRole groupRole) {
        GroupSubjectContractWeb groupSubjectContractWeb = new GroupSubjectContractWeb();
        groupSubjectContractWeb.setUuid(uuid);
        groupSubjectContractWeb.setMember(createIndividualContractWeb(member));
        groupSubjectContractWeb.setRole(GroupRoleContract.fromEntity(groupRole));
        groupSubjectContractWeb.setEncounterMetadata(createEncounterMetadataContract(member));
        return groupSubjectContractWeb;
    }

    private IndividualContract createIndividualContractWeb(Individual individual) {
        IndividualContract individualContractWeb = new IndividualContract();
        individualContractWeb.setId(individual.getId());
        individualContractWeb.setUuid(individual.getUuid());
        individualContractWeb.setFirstName(individual.getFirstName());
        individualContractWeb.setMiddleName(individual.getMiddleName());
        individualContractWeb.setLastName(individual.getLastName());
        if (individual.getSubjectType().isAllowProfilePicture()) {
            individualContractWeb.setProfilePicture(individual.getProfilePicture());
        }
        individualContractWeb.setDateOfBirth(individual.getDateOfBirth());
        individualContractWeb.setSubjectType(SubjectTypeContract.fromSubjectType(individual.getSubjectType()));
        if (individual.getSubjectType().getType().equals(Subject.Person)) {
            individualContractWeb.setGender(individual.getGender().getName());
        }

        return individualContractWeb;
    }

    private EncounterMetadataContract createEncounterMetadataContract(Individual individual) {
        EncounterMetadataContract encounterMetadataContract = new EncounterMetadataContract();

        Long scheduledEncounters = individual.scheduledEncounters().count();
        Long overdueEncounters = individual.scheduledEncounters().filter(encounter -> encounter.getMaxVisitDateTime().isBeforeNow()).count();

        encounterMetadataContract.setDueEncounters(scheduledEncounters - overdueEncounters);
        encounterMetadataContract.setOverdueEncounters(overdueEncounters);
        return encounterMetadataContract;
    }

    public Individual voidSubject(Individual individual) {
        assertNoUnVoidedEncounters(individual);
        assertNoUnVoidedEnrolments(individual);
        individual.setVoided(true);
        return individualRepository.save(individual);
    }

    private void assertNoUnVoidedEnrolments(Individual individual) {
        long nonVoidedProgramEnrolments = individual.getProgramEnrolments()
                .stream()
                .filter(pe -> !pe.isVoided())
                .count();
        if (nonVoidedProgramEnrolments != 0) {
            throw new BadRequestError(String.format("There are non deleted program enrolments for the %s %s", individual.getSubjectType().getOperationalSubjectTypeName(), individual.getFirstName()));
        }
    }

    private void assertNoUnVoidedEncounters(Individual individual) {
        long nonVoidedEncounterCount = individual.nonVoidedEncounters().count();
        if (nonVoidedEncounterCount != 0) {
            throw new BadRequestError(String.format("There are non deleted general encounters for the %s %s", individual.getSubjectType().getOperationalSubjectTypeName(), individual.getFirstName()));
        }
    }

    @Override
    public boolean isScopeEntityChanged(DateTime lastModifiedDateTime, String subjectTypeUUID) {
        SubjectType subjectType = subjectTypeRepository.findByUuid(subjectTypeUUID);
        User user = UserContextHolder.getUserContext().getUser();
        return subjectType != null && isChangedBySubjectTypeRegistrationLocationType(user, lastModifiedDateTime, subjectType.getId(), subjectType, SyncParameters.SyncEntityName.Individual);
    }

    @Override
    public OperatingIndividualScopeAwareRepository repository() {
        return individualRepository;
    }

    public Object getObservationValueForUpload(FormElement formElement, String answerValue) {
        Concept concept = formElement.getConcept();
        SubjectType subjectType = subjectTypeRepository.findByUuid(concept.getKeyValues().get(KeyType.subjectTypeUUID).getValue().toString());
        if (formElement.getType().equals(FormElementType.MultiSelect.name())) {
            String[] providedAnswers = S.splitMultiSelectAnswer(answerValue);
            return Stream.of(providedAnswers)
                    .map(answer -> individualRepository.findByLegacyIdOrUuidAndSubjectType(answer, subjectType).getUuid())
                    .collect(Collectors.toList());
        } else {
            return individualRepository.findByLegacyIdOrUuidAndSubjectType(answerValue, subjectType).getUuid();
        }
    }

    @Messageable(EntityType.Subject)
    public Individual save(Individual individual) {
        individual.addConceptSyncAttributeValues(individual.getSubjectType(), individual.getObservations());
        return individualRepository.save(individual);
    }

    public String findPhoneNumber(Long individualId) {
        return findPhoneNumber(findById(individualId));
    }

    public String findPhoneNumber(Individual individual) {
        assert individual != null;

        Optional<String> phoneNumber = individual.getObservations().entrySet().stream().filter(entrySet -> {
            Concept concept = conceptRepository.findByUuid(entrySet.getKey());
            KeyValues keyValues = concept.getKeyValues();
            ValueType[] valueTypes = {ValueType.yes};
            return (keyValues != null && (keyValues.containsOneOfTheValues(KeyType.contact_number, valueTypes) ||
                    keyValues.containsOneOfTheValues(KeyType.primary_contact, valueTypes)));
        }).map(stringObjectEntry -> (String)stringObjectEntry.getValue()).findFirst();

        return phoneNumber.orElse(null);
    }
}
