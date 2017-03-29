package org.openchs.web;

import org.openchs.dao.AddressLevelRepository;
import org.openchs.dao.GenderRepository;
import org.openchs.dao.IndividualRepository;
import org.openchs.domain.AddressLevel;
import org.openchs.domain.Gender;
import org.openchs.domain.Individual;
import org.openchs.web.request.IndividualRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class IndividualController extends AbstractController<Individual> {
    @Autowired
    private IndividualRepository individualRepository;
    @Autowired
    private AddressLevelRepository addressLevelRepository;
    @Autowired
    private GenderRepository genderRepository;

    @RequestMapping(value = "/individuals", method = RequestMethod.POST)
    void save(@RequestBody IndividualRequest individualRequest) {
        AddressLevel addressLevel = addressLevelRepository.findByUuid(individualRequest.getAddressLevelUUID());
        Gender gender = genderRepository.findByUuid(individualRequest.getGenderUUID());

        Individual individual = newOrExistingEntity(individualRepository, individualRequest, new Individual());
        individual.setName(individualRequest.getName());
        individual.setDateOfBirth(individualRequest.getDateOfBirth());
        individual.setAddressLevel(addressLevel);
        individual.setGender(gender);
        individual.setRegistrationDate(individualRequest.getRegistrationDate());
        individual.setCatchmentId(individualRequest.getCatchmentId());
        individualRepository.save(individual);
    }
}