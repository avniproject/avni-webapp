package org.openchs.web;

import org.openchs.dao.AddressLevelRepository;
import org.openchs.domain.AddressLevel;
import org.openchs.domain.Concept;
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
@RequestMapping("/addressLevel")
public class AddressLevelController {
    @Autowired
    private AddressLevelRepository addressLevelRepository;

    @RequestMapping(method = RequestMethod.GET)
    Page<AddressLevel> getAll(Pageable pageable) {
        return addressLevelRepository.findAll(pageable);
    }

    @RequestMapping(method = RequestMethod.POST)
    ResponseEntity<?> newConcept(@RequestBody AddressLevel addressLevel) {
        addressLevelRepository.save(addressLevel);
        return new ResponseEntity<>(null, new HttpHeaders(), HttpStatus.CREATED);
    }
}