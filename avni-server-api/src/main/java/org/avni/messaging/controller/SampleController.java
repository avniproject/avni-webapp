package org.avni.messaging.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SampleController {

    @RequestMapping(value = "messaging/ping", method = RequestMethod.GET)
    public String ping() {
        return "pong";
    }
}
