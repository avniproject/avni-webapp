package org.openchs.service;

import org.openchs.util.ObjectMapperSingleton;
import org.openchs.web.external.Msg91RestClient;
import org.openchs.web.request.Msg91Request;
import org.openchs.web.response.Msg91Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;

import java.io.IOException;

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

    public void sendOTP(String phoneNumber) {
        Msg91Request msg91Request = new Msg91Request();
        msg91Request.setMobile(phoneNumber);

        addTemplateIdParam(msg91Request);
        addAuthKeyParam(msg91Request);
        logger.info("Request to Msg91: " + sendOTPEndpoint + msg91Request);
        try {
            Msg91Response sendOTPResponse = mapStringResponseToObject(msg91RestClient.callAPI(HttpMethod.GET, sendOTPEndpoint, msg91Request));
            logger.info(sendOTPResponse.toString());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void resendOTP(String phoneNumber) {
        Msg91Request msg91Request = new Msg91Request();
        msg91Request.setMobile(phoneNumber);
        msg91Request.setRetryType("text");      //Default for retry is OTP via phone call. Setting to text forces resending OTP via SMS.
        addAuthKeyParam(msg91Request);
        try {
            Msg91Response resendOTPResponse = mapStringResponseToObject(msg91RestClient.callAPI(HttpMethod.POST, resendOTPEndpoint, msg91Request));
            logger.info(resendOTPResponse.toString());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public boolean verifyOTP(String phoneNumber, String otp) {
        Msg91Request msg91Request = new Msg91Request();
        msg91Request.setMobile(phoneNumber);
        msg91Request.setOtp(otp);
        addAuthKeyParam(msg91Request);
        try {
            Msg91Response verifyOTPResponse = mapStringResponseToObject(msg91RestClient.callAPI(HttpMethod.POST, verifyOTPEndpoint, msg91Request));
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean checkBalance(String authKey) {
        Msg91Request msg91Request = new Msg91Request();
        msg91Request.setAuthKey(authKey);
        msg91Request.setType("106");    //106 is send otp

        String response = msg91RestClient.callAPI(HttpMethod.GET, checkBalanceEndpoint, msg91Request); //API returns string so no mapping performed
        return false;
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
}
