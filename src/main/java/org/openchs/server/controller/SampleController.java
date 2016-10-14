package org.openchs.server.controller;

import org.springframework.web.bind.annotation.*;

@RestController
public class SampleController {
    @RequestMapping("/")
    String home() {
        return "Hello World!";
    }
}