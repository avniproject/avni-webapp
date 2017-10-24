package org.openchs.web;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SampleController {
    @RequestMapping("/ping")
    @PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
    String ping() {
        return "pong";
    }

    @RequestMapping("/hello")
    String hello() {
        return "world";
    }
}