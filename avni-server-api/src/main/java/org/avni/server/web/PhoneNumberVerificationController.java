package org.avni.server.web;

import org.avni.server.service.PhoneNumberVerificationService;
import org.avni.server.web.response.PhoneNumberVerificationResponse;
import org.avni.server.web.request.PhoneNumberVerificationRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.security.GeneralSecurityException;

@RestController
public class PhoneNumberVerificationController {
    private final Logger logger;
    private final PhoneNumberVerificationService phoneNumberVerificationService;

    @Autowired
    public PhoneNumberVerificationController(PhoneNumberVerificationService phoneNumberVerificationService) {
        this.logger = LoggerFactory.getLogger(this.getClass());
        this.phoneNumberVerificationService = phoneNumberVerificationService;
    }

    @RequestMapping(value = "/phoneNumberVerification/otp/send", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public ResponseEntity<PhoneNumberVerificationResponse> sendOTP(@RequestBody PhoneNumberVerificationRequest phoneNumberVerificationRequest) throws IOException, GeneralSecurityException {
        logger.info("Request: " + phoneNumberVerificationRequest.getPhoneNumber());
        PhoneNumberVerificationResponse phoneNumberVerificationResponse
                = phoneNumberVerificationService.sendOTP(phoneNumberVerificationRequest);
        return phoneNumberVerificationResponse.isSuccess() ?
                ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(phoneNumberVerificationResponse) :
                ResponseEntity.badRequest().contentType(MediaType.APPLICATION_JSON).body(phoneNumberVerificationResponse);
    }

    @RequestMapping(value = "/phoneNumberVerification/otp/resend", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public ResponseEntity<PhoneNumberVerificationResponse> resendOTP(@RequestBody PhoneNumberVerificationRequest phoneNumberVerificationRequest) throws IOException, GeneralSecurityException {
        PhoneNumberVerificationResponse phoneNumberVerificationResponse
                = phoneNumberVerificationService.resendOTP(phoneNumberVerificationRequest);
        return phoneNumberVerificationResponse.isSuccess() ?
                ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(phoneNumberVerificationResponse) :
                ResponseEntity.badRequest().contentType(MediaType.APPLICATION_JSON).body(phoneNumberVerificationResponse);
    }

    @RequestMapping(value = "/phoneNumberVerification/otp/verify", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public ResponseEntity<PhoneNumberVerificationResponse> verifyOTP(@RequestBody PhoneNumberVerificationRequest phoneNumberVerificationRequest) throws IOException, GeneralSecurityException {
        PhoneNumberVerificationResponse phoneNumberVerificationResponse
                = phoneNumberVerificationService.verifyOTP(phoneNumberVerificationRequest);
        return phoneNumberVerificationResponse.isSuccess() ?
                ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(phoneNumberVerificationResponse) :
                ResponseEntity.badRequest().contentType(MediaType.APPLICATION_JSON).body(phoneNumberVerificationResponse);
    }
}
