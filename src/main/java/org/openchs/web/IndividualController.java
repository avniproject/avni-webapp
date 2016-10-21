package org.openchs.web;

import org.openchs.dao.IndividualRepository;
import org.openchs.domain.Individual;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/individual")
public class IndividualController {
    @Autowired
    private IndividualRepository individualRepository;

    @RequestMapping(method = RequestMethod.GET)
    Page<Individual> getAll(Pageable pageable) {
        return individualRepository.findAll(pageable);
    }

    @RequestMapping(method = RequestMethod.POST)
    ResponseEntity<?> newIndividual(@RequestBody Individual individual) {
        individualRepository.save(individual);
        return new ResponseEntity<>(null, new HttpHeaders(), HttpStatus.CREATED);
    }
}