package org.avni.server.web;

import org.avni.server.dao.Msg91ConfigRepository;
import org.avni.server.domain.Msg91Config;
import org.avni.server.framework.security.UserContextHolder;
import org.avni.server.service.Msg91ConfigService;
import org.avni.server.service.OrganisationConfigService;
import org.avni.server.service.PhoneNumberVerificationService;
import org.avni.server.util.BadRequestError;
import org.avni.server.web.request.Msg91ConfigContract;
import org.avni.server.web.response.PhoneNumberVerificationResponse;
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
import java.util.UUID;

@RestController
public class Msg91ConfigController extends AbstractController<Msg91Config> implements RestControllerResourceProcessor<Msg91Config> {
    private final Logger logger;
    private final Msg91ConfigRepository msg91ConfigRepository;
    private final PhoneNumberVerificationService phoneNumberVerificationService;
    private final Msg91ConfigService msg91ConfigService;
    private final OrganisationConfigService organisationConfigService;

    @Autowired
    public Msg91ConfigController(Msg91ConfigRepository msg91ConfigRepository, PhoneNumberVerificationService phoneNumberVerificationService, Msg91ConfigService msg91ConfigService, OrganisationConfigService organisationConfigService) {
        this.msg91ConfigRepository = msg91ConfigRepository;
        this.phoneNumberVerificationService = phoneNumberVerificationService;
        this.msg91ConfigService = msg91ConfigService;
        this.organisationConfigService = organisationConfigService;
        this.logger = LoggerFactory.getLogger(this.getClass());
    }

    @RequestMapping(value = "/web/msg91Config", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    public ResponseEntity<Msg91ConfigContract> storeConfiguration(@RequestBody Msg91ConfigContract request) throws GeneralSecurityException {
        Long orgId = UserContextHolder.getUserContext().getOrganisation().getId();
        Msg91Config msg91Config = msg91ConfigRepository.findByOrganisationIdAndIsVoidedFalse(orgId);
        if (msg91Config == null) {
            if (request.getAuthKey() == null || request.getOtpSmsTemplateId() == null) {
                throw new BadRequestError("authKey and otpSmsTemplateId are mandatory fields");
            }
            msg91Config = new Msg91Config();
            msg91Config.setUuid(UUID.randomUUID().toString());
        }
        if (request.getAuthKey() != null) {
            msg91Config.setAuthKey(msg91ConfigService.encryptAuthKey(request.getAuthKey()));
        }
        msg91Config.setOtpSmsTemplateId(request.getOtpSmsTemplateId());
        msg91Config.setOtpLength(request.getOtpLength());
        msg91Config.setVoided(request.isVoided());
        Msg91Config savedConfig = msg91ConfigRepository.save(msg91Config);
        organisationConfigService.updateSettings("otpLength", request.getOtpLength());
        return ResponseEntity.ok().body(Msg91ConfigContract.fromMsg91Config(savedConfig, null));
    }

    @RequestMapping(value = "/web/msg91Config", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    public ResponseEntity<Msg91ConfigContract> getConfiguration() throws GeneralSecurityException {
        Long orgId = UserContextHolder.getUserContext().getOrganisation().getId();
        Msg91Config msg91Config = msg91ConfigRepository.findByOrganisationIdAndIsVoidedFalse(orgId);
        if (msg91Config != null) {
            String decryptedAuthKey = msg91ConfigService.decryptAuthKey(msg91Config.getAuthKey());
            return ResponseEntity.ok().body(Msg91ConfigContract.fromMsg91Config(msg91Config, msg91ConfigService.maskAuthKey(decryptedAuthKey)));
        } else {
            return ResponseEntity.ok().body(new Msg91ConfigContract());
        }
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
