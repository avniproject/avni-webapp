package org.avni.server.service;

import org.avni.server.dao.Msg91ConfigRepository;
import org.avni.server.domain.Msg91Config;
import org.avni.server.framework.security.UserContextHolder;
import org.avni.server.util.ObjectMapperSingleton;
import org.avni.server.web.external.Msg91RestClient;
import org.avni.server.web.request.Msg91Request;
import org.avni.server.web.request.PhoneNumberVerificationRequest;
import org.avni.server.web.response.Msg91Response;
import org.avni.server.web.response.PhoneNumberVerificationResponse;
import org.avni.server.web.validation.ValidationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.ConnectException;
import java.security.GeneralSecurityException;

import static java.lang.String.format;

@Service
public class PhoneNumberVerificationService {

    private final Msg91RestClient msg91RestClient;
    private final Msg91ConfigRepository msg91ConfigRepository;
    private final Msg91ConfigService msg91ConfigService;
    private final Logger logger;
    private final static String sendOTPEndpoint = "/api/v5/otp?authkey={authkey}&template_id={template_id}&mobile={mobile}&otp_length={otp_length}&otp_expiry={otp_expiry}";
    private final static String resendOTPEndpoint = "/api/v5/otp/retry?authkey={authkey}&mobile={mobile}&retrytype={retrytype}";
    private final static String verifyOTPEndpoint = "/api/v5/otp/verify?authkey={authkey}&mobile={mobile}&otp={otp}";
    private final static String checkBalanceEndpoint = "/api/balance.php?authkey={authkey}&type={type}";
    @Value("${avni.connectToMsg91InDev}")
    private boolean msg91InDev;

    private final Boolean isDev;

    @Autowired
    public PhoneNumberVerificationService(Msg91RestClient msg91RestClient, Msg91ConfigRepository msg91ConfigRepository, Msg91ConfigService msg91ConfigService, Boolean isDev) {
        this.msg91RestClient = msg91RestClient;
        this.msg91ConfigRepository = msg91ConfigRepository;
        this.msg91ConfigService = msg91ConfigService;
        this.isDev = isDev;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    public PhoneNumberVerificationResponse sendOTP(PhoneNumberVerificationRequest request) throws IOException, GeneralSecurityException {
        if (isDev && !msg91InDev) {
            return new PhoneNumberVerificationResponse(true, null);
        }

        Msg91Request msg91Request = createMsg91Request();
        msg91Request.setOtpLength(request.getOtpLength());
        msg91Request.setMobile(validateAndAddCountryCodeToPhoneNumber(request.getPhoneNumber()));

        PhoneNumberVerificationResponse phoneNumberVerificationResponse = processMsg91Request(HttpMethod.GET, sendOTPEndpoint, msg91Request, true);
        if (!phoneNumberVerificationResponse.isSuccess()) {
            handleMsg91Errors(phoneNumberVerificationResponse.getMsg91Response().getMessage());
            handleMsg91Errors(phoneNumberVerificationResponse.getMsg91Response().getCode());
        }
        return phoneNumberVerificationResponse;

    }

    public PhoneNumberVerificationResponse resendOTP(PhoneNumberVerificationRequest request) throws IOException, GeneralSecurityException {
        if (isDev && !msg91InDev) {
            return new PhoneNumberVerificationResponse(true, null);
        }

        Msg91Request msg91Request = createMsg91Request();
        msg91Request.setMobile(validateAndAddCountryCodeToPhoneNumber(request.getPhoneNumber()));
        msg91Request.setOtpLength(request.getOtpLength());
        msg91Request.setRetryType("text");      //Default Msg91 behaviour for retry is OTP via phone call. Setting to text forces resending OTP via SMS.

        PhoneNumberVerificationResponse phoneNumberVerificationResponse = processMsg91Request(HttpMethod.POST, resendOTPEndpoint, msg91Request, true);
        if (!phoneNumberVerificationResponse.isSuccess()) {
            handleMsg91Errors(phoneNumberVerificationResponse.getMsg91Response().getMessage());
        }
        return phoneNumberVerificationResponse;
    }

    public PhoneNumberVerificationResponse verifyOTP(PhoneNumberVerificationRequest request) throws IOException, GeneralSecurityException {
        if (isDev && !msg91InDev) {
            return new PhoneNumberVerificationResponse(request.getOtp().equals("1234"), null);
        }

        Msg91Request msg91Request = createMsg91Request();
        msg91Request.setMobile(validateAndAddCountryCodeToPhoneNumber(request.getPhoneNumber()));
        msg91Request.setOtp(request.getOtp());
        msg91Request.setOtpLength(request.getOtpLength());

        PhoneNumberVerificationResponse phoneNumberVerificationResponse = processMsg91Request(HttpMethod.POST, verifyOTPEndpoint, msg91Request, true);
        if (!phoneNumberVerificationResponse.isSuccess()) {
            handleMsg91Errors(phoneNumberVerificationResponse.getMsg91Response().getMessage());
        }
        return phoneNumberVerificationResponse;
    }

    public PhoneNumberVerificationResponse checkBalance(String authKey) throws IOException {
        Msg91Request msg91Request = new Msg91Request();
        msg91Request.setAuthKey(authKey);
        msg91Request.setType("106");    //106 is send otp balance type

        PhoneNumberVerificationResponse phoneNumberVerificationResponse = processMsg91Request(HttpMethod.GET, checkBalanceEndpoint, msg91Request, false);
        String responseText = phoneNumberVerificationResponse.getMsg91Response().getMessage();
        try {
            Integer.parseInt(responseText);
            return phoneNumberVerificationResponse;
        } catch (NumberFormatException numberFormatException) {
            logger.error(format("Msg91: Check Balance API response is not an integer. Response: %s", responseText));
            logger.error("Attempting to treat response as Msg91Response");
            Msg91Response msg91Response = mapStringResponseToObject(responseText);
            PhoneNumberVerificationResponse checkBalanceResponse = processMsg91Response(msg91Response);
            handleMsg91Errors(checkBalanceResponse.getMsg91Response().getMsg());
            return checkBalanceResponse;
        }
    }

    private Msg91Response mapStringResponseToObject(String responseString) throws IOException {
        return ObjectMapperSingleton.getObjectMapper().readValue(responseString, Msg91Response.class);
    }

    private PhoneNumberVerificationResponse processMsg91Request(HttpMethod method, String uri, Msg91Request msg91Request, boolean convertResponseStringToObject) throws IOException {
        try {
            String apiResponse = msg91RestClient.callAPI(method, uri, msg91Request);
            if (convertResponseStringToObject) {
                Msg91Response msg91Response = mapStringResponseToObject(apiResponse);
                return processMsg91Response(msg91Response);
            } else {
                Msg91Response msg91Response = new Msg91Response();
                msg91Response.setMessage(apiResponse);
                return new PhoneNumberVerificationResponse(true, msg91Response);
            }
        } catch (IOException ioException) {
            logger.error(format("Error in phone number verification flow. API: %s, Request: %s", uri, msg91Request));
            ioException.printStackTrace();
            throw ioException;
        }
    }

    private PhoneNumberVerificationResponse processMsg91Response(Msg91Response msg91Response) {
        String responseType = msg91Response.getType() != null ? msg91Response.getType() : msg91Response.getMsgType();
        if (responseType.equals(Msg91Response.responseTypes.success.toString())) {
            return new PhoneNumberVerificationResponse(true, msg91Response);
        } else {
            logger.error(format("Error response from Msg91. Response: %s", msg91Response));
            return new PhoneNumberVerificationResponse(false, msg91Response);
        }
    }

    private void handleMsg91Errors(String errorString) throws ConnectException {
        switch (errorString) {
            case "Message don't contains otp":
                throw new ConnectException("Msg91 - Message template does not contain OTP");
            case "invalid_otp_expiry":
                throw new ConnectException("Msg91 - Invalid OTP expiry");
            case "otp_expiry_out_of_limit":
                throw new ConnectException("Msg91 - OTP Expiry Out of Limit.");
            case "OTP request invalid":
                throw new ConnectException("Msg 91 - OTP request invalid");
            case "Invalid authkey":
            case "201":               //Not in Msg91 documentation but receiving this while testing with invalid authkey
            case "207":
                throw new ConnectException("Msg91 - Invalid authentication key");
            case "302":
                throw new ConnectException("Msg91 - Expired user account");
            case "303":
                throw new ConnectException("Msg91 - Banned user account");
            case "304":
                throw new ConnectException("Msg91 - 304");
            case "418":
                throw new ConnectException("Msg91 - Additional security enabled. IP not whitelisted.");
        }
    }

    private Msg91Request createMsg91Request() throws ConnectException, GeneralSecurityException {
        Long orgId = UserContextHolder.getUserContext().getOrganisation().getId();
        Msg91Config msg91Config = msg91ConfigRepository.findByOrganisationIdAndIsVoidedFalse(orgId);
        if (msg91Config == null) {
            throw new ConnectException("Msg91 not configured for organisation");
        }
        Msg91Request msg91Request = new Msg91Request();
        msg91Request.setAuthKey(msg91ConfigService.decryptAuthKey(msg91Config.getAuthKey()));
        msg91Request.setTemplateId(msg91Config.getOtpSmsTemplateId());
        msg91Request.setOtpExpiry("10");        // Default expiry value in minutes for all OTPs
        return msg91Request;
    }

    private String validateAndAddCountryCodeToPhoneNumber(String phoneNumber) {
        String MOBILE_NUMBER_PATTERN = "^[0-9]{10}";

        if (!phoneNumber.trim().matches(MOBILE_NUMBER_PATTERN)) {
            throw new ValidationException(String.format("Invalid phone number: %s", phoneNumber));
        }
        return "91" + phoneNumber.trim();
    }
}
