package org.openchs.web;

import org.openchs.dao.LocationRepository;
import org.openchs.dao.GenderRepository;
import org.openchs.dao.IndividualRepository;
import org.openchs.domain.AddressLevel;
import org.openchs.domain.Gender;
import org.openchs.domain.Individual;
import org.openchs.service.ObservationService;
import org.openchs.web.request.IndividualRequest;
import org.openchs.web.request.IndividualWithHistory;
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
    private final LocationRepository locationRepository;
    private final GenderRepository genderRepository;
    private ObservationService observationService;

    private static org.slf4j.Logger logger = LoggerFactory.getLogger(IndividualController.class);

    @Autowired
    public IndividualController(IndividualRepository individualRepository, LocationRepository locationRepository, GenderRepository genderRepository, ObservationService observationService) {
        this.individualRepository = individualRepository;
        this.locationRepository = locationRepository;
        this.genderRepository = genderRepository;
        this.observationService = observationService;
    }

    @RequestMapping(value = "/individuals", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
    public void save(@RequestBody IndividualRequest individualRequest) {
        logger.info(String.format("Saving individual with UUID %s", individualRequest.getUuid()));

        Individual individual = createIndividualWithoutObservations(individualRequest);
        individual.setObservations(observationService.createObservations(individualRequest.getObservations()));
        individualRepository.save(individual);
        logger.info(String.format("Saved individual with UUID %s", individualRequest.getUuid()));
    }

    private Individual createIndividualWithoutObservations(@RequestBody IndividualRequest individualRequest) {
        AddressLevel addressLevel = getAddressLevel(individualRequest);
        Gender gender = individualRequest.getGender() == null ? genderRepository.findByUuid(individualRequest.getGenderUUID()) : genderRepository.findByName(individualRequest.getGender());
        Individual individual = newOrExistingEntity(individualRepository, individualRequest, new Individual());
        individual.setFirstName(individualRequest.getFirstName());
        individual.setLastName(individualRequest.getLastName());
        individual.setDateOfBirth(individualRequest.getDateOfBirth());
        individual.setAddressLevel(addressLevel);
        individual.setGender(gender);
        individual.setRegistrationDate(individualRequest.getRegistrationDate());
        individual.setVoided(individualRequest.isVoided());
        return individual;
    }

    private AddressLevel getAddressLevel(@RequestBody IndividualRequest individualRequest) {
        if (individualRequest.getAddressLevelUUID() != null) {
            return locationRepository.findByUuid(individualRequest.getAddressLevelUUID());
        } else if (individualRequest.getAddressLevelUUID() == null && individualRequest.getCatchmentUUID() != null) {
            return locationRepository.findByTitleAndCatchmentsUuid(individualRequest.getAddressLevel(), individualRequest.getCatchmentUUID());
        } else {
            return locationRepository.findByTitleIgnoreCase(individualRequest.getAddressLevel());
        }
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