package org.openchs.web;

import org.openchs.dao.Msg91ConfigRepository;
import org.openchs.domain.Msg91Config;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.service.PhoneNumberVerificationService;
import org.openchs.web.request.Msg91ConfigContract;
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
import java.util.UUID;

@RestController
public class Msg91ConfigController extends AbstractController<Msg91Config> implements RestControllerResourceProcessor<Msg91Config> {
    private final Logger logger;
    private final Msg91ConfigRepository msg91ConfigRepository;
    private final PhoneNumberVerificationService phoneNumberVerificationService;

    @Autowired
    public Msg91ConfigController(Msg91ConfigRepository msg91ConfigRepository, PhoneNumberVerificationService phoneNumberVerificationService) {
        this.msg91ConfigRepository = msg91ConfigRepository;
        this.phoneNumberVerificationService = phoneNumberVerificationService;
        this.logger = LoggerFactory.getLogger(this.getClass());
    }

    @RequestMapping(value = "/web/msg91Config", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    public ResponseEntity<Msg91ConfigContract> storeConfiguration(@RequestBody Msg91ConfigContract request) {
        Long orgId = UserContextHolder.getUserContext().getOrganisation().getId();
        Msg91Config msg91Config = msg91ConfigRepository.findByOrganisationIdAndIsVoidedFalse(orgId);
        if (msg91Config == null) {
            msg91Config = new Msg91Config();
            msg91Config.setUuid(UUID.randomUUID().toString());
        }
        msg91Config.setAuthKey(request.getAuthKey());
        msg91Config.setOtpSmsTemplateId(request.getOtpSmsTemplateId());
        msg91Config.setOtpLength(request.getOtpLength());
        msg91Config.setVoided(request.isVoided());
        return ResponseEntity.ok().body(Msg91ConfigContract.fromMsg91Config(msg91ConfigRepository.save(msg91Config)));
    }

    @RequestMapping(value = "/web/msg91Config", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    public ResponseEntity<Msg91ConfigContract> getConfiguration() {
        Long orgId = UserContextHolder.getUserContext().getOrganisation().getId();
        Msg91Config msg91Config = msg91ConfigRepository.findByOrganisationIdAndIsVoidedFalse(orgId);
        return msg91Config != null ?
            ResponseEntity.ok().body(Msg91ConfigContract.fromMsg91Config(msg91ConfigRepository.save(msg91Config))) :
                ResponseEntity.badRequest().body(new Msg91ConfigContract());
    }

    @RequestMapping(value = "/web/msg91Config/check", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    public ResponseEntity<PhoneNumberVerificationResponse> verifyConfiguration(@RequestBody Msg91ConfigContract request) throws IOException {
        PhoneNumberVerificationResponse phoneNumberVerificationResponse
                = phoneNumberVerificationService.checkBalance(request.getAuthKey());
        return phoneNumberVerificationResponse.isSuccess() ?
                ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(phoneNumberVerificationResponse) :
                ResponseEntity.badRequest().contentType(MediaType.APPLICATION_JSON).body(phoneNumberVerificationResponse);
    }
}
