package org.openchs.web;

import org.openchs.service.PhoneNumberVerificationService;
import org.openchs.util.BadRequestError;
import org.openchs.web.request.PhoneNumberVerificationRequest;
import org.openchs.web.response.PhoneNumberVerificationResponse;
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
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    public ResponseEntity<PhoneNumberVerificationResponse> sendOTP(@RequestBody PhoneNumberVerificationRequest phoneNumberVerificationRequest) {
        logger.info("Request: " + phoneNumberVerificationRequest.getPhoneNumber());
        try {
            PhoneNumberVerificationResponse phoneNumberVerificationResponse = phoneNumberVerificationService.sendOTP(phoneNumberVerificationRequest.getPhoneNumber());
            return phoneNumberVerificationResponse.isSuccess() ?
                    ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(phoneNumberVerificationResponse) :
                    ResponseEntity.badRequest().contentType(MediaType.APPLICATION_JSON).body(phoneNumberVerificationResponse);
        } catch (IOException e) {
            throw new BadRequestError(e.getMessage());
        }
    }

    @RequestMapping(value = "/phoneNumberVerification/otp/resend", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    public ResponseEntity<PhoneNumberVerificationResponse> resendOTP(@RequestBody PhoneNumberVerificationRequest phoneNumberVerificationRequest) {
        try {
            PhoneNumberVerificationResponse phoneNumberVerificationResponse = phoneNumberVerificationService.resendOTP(phoneNumberVerificationRequest.getPhoneNumber());
            return phoneNumberVerificationResponse.isSuccess() ?
                    ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(phoneNumberVerificationResponse) :
                    ResponseEntity.badRequest().contentType(MediaType.APPLICATION_JSON).body(phoneNumberVerificationResponse);
        } catch (IOException e) {
            throw new BadRequestError(e.getMessage());
        }
    }

    @RequestMapping(value = "/phoneNumberVerification/otp/verify", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    public ResponseEntity<PhoneNumberVerificationResponse> verifyOTP(@RequestBody PhoneNumberVerificationRequest phoneNumberVerificationRequest) {
        try {
            PhoneNumberVerificationResponse phoneNumberVerificationResponse = phoneNumberVerificationService.verifyOTP(phoneNumberVerificationRequest.getPhoneNumber(), phoneNumberVerificationRequest.getOtp());
            return phoneNumberVerificationResponse.isSuccess() ?
                    ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(phoneNumberVerificationResponse) :
                    ResponseEntity.badRequest().contentType(MediaType.APPLICATION_JSON).body(phoneNumberVerificationResponse);
        } catch (IOException e) {
            throw new BadRequestError(e.getMessage());

        }
    }

    @RequestMapping(value = "/phoneNumberVerification/otp/setup", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    public void storeConfiguration() {

    }

    @RequestMapping(value = "/phoneNumberVerification/otp/setup/check", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    public ResponseEntity<PhoneNumberVerificationResponse> verifyConfiguration() {
        try {
            PhoneNumberVerificationResponse phoneNumberVerificationResponse = phoneNumberVerificationService.checkBalance("352153AeIrN0yEO0T600670dfP1");
            return phoneNumberVerificationResponse.isSuccess() ?
                    ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(phoneNumberVerificationResponse) :
                    ResponseEntity.badRequest().contentType(MediaType.APPLICATION_JSON).body(phoneNumberVerificationResponse);
        } catch (IOException e) {
            throw new BadRequestError(e.getMessage());
        }
    }

}
