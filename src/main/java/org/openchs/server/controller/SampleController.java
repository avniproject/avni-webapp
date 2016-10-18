package org.openchs.server.controller;

import org.openchs.server.dao.IndividualRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
public class SampleController {
    @RequestMapping("/")
    String home() {
        return "Hello World!";
    }
}