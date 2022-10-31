package org.avni.server.web;

import org.avni.server.service.ExotelService;
import org.avni.server.web.response.ExotelResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.ConnectException;

@RestController
public class ExotelController {

    private final Logger logger;
    private final ExotelService exotelService;

    @Autowired
    public ExotelController(ExotelService exotelService) {
        this.exotelService = exotelService;
        this.logger = LoggerFactory.getLogger(this.getClass());
    }

    @RequestMapping(value = "/maskedCall", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public ExotelResponse callMask(@RequestParam(name = "to") String to) {
        try {
            return exotelService.makeMaskedCall(to);
        } catch (ConnectException e) {
            return new ExotelResponse(false, e.getMessage());
        }
    }
}
