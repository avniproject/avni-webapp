package org.openchs.web;

import org.springframework.web.bind.annotation.*;

@RestController
public class SampleController {
    @RequestMapping("/")
    String home() {
        return "Hello World!";
    }
}