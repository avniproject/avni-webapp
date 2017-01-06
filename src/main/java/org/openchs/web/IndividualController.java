package org.openchs.web;

import org.joda.time.DateTime;
import org.openchs.dao.AddressLevelRepository;
import org.openchs.dao.GenderRepository;
import org.openchs.dao.IndividualRepository;
import org.openchs.dao.UserRepository;
import org.openchs.domain.AddressLevel;
import org.openchs.domain.Gender;
import org.openchs.domain.Individual;
import org.openchs.domain.User;
import org.openchs.web.request.IndividualRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class IndividualController {
    @Autowired
    private IndividualRepository individualRepository;
    @Autowired
    private AddressLevelRepository addressLevelRepository;
    @Autowired
    private GenderRepository genderRepository;
    @Autowired
    private UserRepository userRepository;

    @RequestMapping(value = "/individuals", method = RequestMethod.POST)
    void save(@RequestBody IndividualRequest individualRequest) {
        AddressLevel addressLevel = addressLevelRepository.findByUuid(individualRequest.getAddressLevelUUID());
        Gender gender = genderRepository.findByUuid(individualRequest.getGenderUUID());
        User user = userRepository.findByUuid(individualRequest.getUserUUID());

        Individual individual = newOrExistingEntity(individualRequest, user);
        individual.setName(individualRequest.getName());
        individual.setDateOfBirth(individualRequest.getDateOfBirth());
        individual.setAddressLevel(addressLevel);
        individual.setGender(gender);
        individual.setLastModifiedBy(user);
        individual.setLastModifiedDateTime(DateTime.now());
        individualRepository.save(individual);
    }

    private Individual newOrExistingEntity(IndividualRequest individualRequest, User user) {
        Individual existingIndividual = individualRepository.findByUuid(individualRequest.getUuid());
        if (existingIndividual == null) {
            Individual individual = new Individual();
            individual.setCreatedBy(user);
            individual.setCreatedDateTime(DateTime.now());
            individual.setUuid(individualRequest.getUuid());
            return individual;
        }
        else return existingIndividual;
    }
}