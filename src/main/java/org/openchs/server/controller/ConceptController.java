package org.openchs.server.controller;

import org.openchs.server.dao.ConceptRepository;
import org.openchs.server.domain.Concept;
import org.openchs.server.domain.Individual;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/concept")
public class ConceptController {
    @Autowired
    private ConceptRepository conceptRepository;

    @RequestMapping(method = RequestMethod.GET)
    Page<Concept> getAll(Pageable pageable) {
        return conceptRepository.findAll(pageable);
    }

    @RequestMapping(method = RequestMethod.POST)
    ResponseEntity<?> newConcept(@RequestBody Concept concept) {
        conceptRepository.save(concept);
        return new ResponseEntity<>(null, new HttpHeaders(), HttpStatus.CREATED);
    }
}