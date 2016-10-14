package org.openchs.server.controller;

import org.openchs.server.dao.AllIndividuals;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
public class SampleController {
    @Autowired
    private AllIndividuals allIndividuals;

    @RequestMapping("/")
    String home() {
        allIndividuals.findAll();
        return "Hello World!";
    }
}