package org.openchs.web;

import org.openchs.dao.AddressLevelRepository;
import org.openchs.dao.GenderRepository;
import org.openchs.dao.IndividualRepository;
import org.openchs.domain.AddressLevel;
import org.openchs.domain.Gender;
import org.openchs.domain.Individual;
import org.openchs.util.LockProvider;
import org.openchs.web.request.IndividualRequest;
import org.openchs.web.request.IndividualWithHistory;
import org.openchs.service.ObservationService;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;

@RestController
public class IndividualController extends AbstractController<Individual> {
    private final IndividualRepository individualRepository;
    private final AddressLevelRepository addressLevelRepository;
    private final GenderRepository genderRepository;
    private ObservationService observationService;

    private static org.slf4j.Logger logger = LoggerFactory.getLogger(IndividualController.class);

    @Autowired
    public IndividualController(IndividualRepository individualRepository, AddressLevelRepository addressLevelRepository, GenderRepository genderRepository, ObservationService observationService) {
        this.individualRepository = individualRepository;
        this.addressLevelRepository = addressLevelRepository;
        this.genderRepository = genderRepository;
        this.observationService = observationService;
    }

    @RequestMapping(value = "/individuals", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
    public void save(@RequestBody IndividualRequest individualRequest) {
        synchronized (LockProvider.getLockObject(this)) {
            saveInternal(individualRequest);
        }
    }

    @Transactional
    public void saveInternal(IndividualRequest individualRequest) {
        Individual individual = createIndividualWithoutObservations(individualRequest);
        individual.setObservations(observationService.createObservations(individualRequest.getObservations()));
        logger.info(String.format("Import Individual with UUID %s and with organisation id %s", individual.getUuid(), String.valueOf(individual.getOrganisationId())));
        individualRepository.save(individual);
    }

    private Individual createIndividualWithoutObservations(@RequestBody IndividualRequest individualRequest) {
        AddressLevel addressLevel = individualRequest.getAddressLevelUUID() == null ? addressLevelRepository.findByTitle(individualRequest.getAddressLevel()) : addressLevelRepository.findByUuid(individualRequest.getAddressLevelUUID());
        Gender gender = individualRequest.getGender() == null ? genderRepository.findByUuid(individualRequest.getGenderUUID()) : genderRepository.findByName(individualRequest.getGender());
        Individual individual = newOrExistingEntity(individualRepository, individualRequest, new Individual());
        individual.setFirstName(individualRequest.getFirstName());
        individual.setLastName(individualRequest.getLastName());
        individual.setDateOfBirth(individualRequest.getDateOfBirth());
        individual.setAddressLevel(addressLevel);
        individual.setGender(gender);
        individual.setRegistrationDate(individualRequest.getRegistrationDate());
        return individual;
    }

    @RequestMapping(value = "/individualAndHistory", method = RequestMethod.POST)
    @Transactional
    void save(@RequestBody IndividualWithHistory individualWithHistory) {

//        KeyValueIndividualRequest individual = individualWithHistory.getIndividual();
//        this.save(individual);
//
//        ProgramEnrolmentRequest programEnrolmentRequest = individualWithHistory.getEnrolment();
//        programEnrolmentRequest.setIndividualUUID(individual.getUuid());
//        programEnrolmentController.save(programEnrolmentRequest);
//
//        individualWithHistory.getEncounters().forEach(programEncounterRequest -> {
//            programEncounterRequest.setProgramEnrolmentUUID(programEnrolmentRequest.getUuid());
//            programEncounterController.save(programEncounterRequest);
//        });
    }
}