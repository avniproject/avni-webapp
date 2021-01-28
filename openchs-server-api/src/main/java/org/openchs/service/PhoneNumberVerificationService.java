package org.openchs.service;

import org.openchs.util.ObjectMapperSingleton;
import org.openchs.web.external.Msg91RestClient;
import org.openchs.web.request.Msg91Request;
import org.openchs.web.response.Msg91Response;
import org.openchs.web.response.PhoneNumberVerificationResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.ConnectException;

import static java.lang.String.format;

@Service
public class PhoneNumberVerificationService {

    private final Msg91RestClient msg91RestClient;
    private final Logger logger;
    private final static String sendOTPEndpoint = "/api/v5/otp?authkey={authkey}&template_id={template_id}&mobile={mobile}&otp_length={otp_length}&otp_expiry={otp_expiry}";
    private final static String resendOTPEndpoint = "/api/v5/otp/retry?authkey={authkey}&mobile={mobile}&retrytype={retrytype}";
    private final static String verifyOTPEndpoint = "/api/v5/otp/verify?authkey={authkey}&mobile={mobile}&otp={otp}";
    private final static String checkBalanceEndpoint = "/api/balance.php?authkey={authkey}&type={type}";

    @Autowired
    public PhoneNumberVerificationService(Msg91RestClient msg91RestClient) {
        this.msg91RestClient = msg91RestClient;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    public PhoneNumberVerificationResponse sendOTP(String phoneNumber) throws IOException {
        Msg91Request msg91Request = new Msg91Request();
        msg91Request.setMobile(phoneNumber);
        addTemplateIdParam(msg91Request);
        addAuthKeyParam(msg91Request);
        PhoneNumberVerificationResponse phoneNumberVerificationResponse = processMsg91Request(HttpMethod.GET, sendOTPEndpoint, msg91Request, true);
        if (!phoneNumberVerificationResponse.isSuccess()) {
            handleMsg91Errors(phoneNumberVerificationResponse.getMsg91Response().getMessage());
            handleMsg91Errors(phoneNumberVerificationResponse.getMsg91Response().getCode());
        }
        return phoneNumberVerificationResponse;

    }

    public PhoneNumberVerificationResponse resendOTP(String phoneNumber) throws IOException {
        Msg91Request msg91Request = new Msg91Request();
        msg91Request.setMobile(phoneNumber);
        msg91Request.setRetryType("text");      //Default Msg91 behaviour for retry is OTP via phone call. Setting to text forces resending OTP via SMS.
        addAuthKeyParam(msg91Request);

        PhoneNumberVerificationResponse phoneNumberVerificationResponse =  processMsg91Request(HttpMethod.POST, resendOTPEndpoint, msg91Request, true);
        if (!phoneNumberVerificationResponse.isSuccess()) {
            handleMsg91Errors(phoneNumberVerificationResponse.getMsg91Response().getMessage());
        }
        return phoneNumberVerificationResponse;
    }

    public PhoneNumberVerificationResponse verifyOTP(String phoneNumber, String otp) throws IOException {
        Msg91Request msg91Request = new Msg91Request();
        msg91Request.setMobile(phoneNumber);
        msg91Request.setOtp(otp);
        addAuthKeyParam(msg91Request);

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

    private Msg91Request addAuthKeyParam(Msg91Request msg91Request) {
        String authKey = "352153AeIrN0yEO0T600670dfP1";
        msg91Request.setAuthKey(authKey);
        return msg91Request;
    }

    private Msg91Request addTemplateIdParam(Msg91Request msg91Request) {
        String templateId = "600e91b4c61ef736bf0b88b2";
        msg91Request.setTemplateId(templateId);
        return msg91Request;
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
}
