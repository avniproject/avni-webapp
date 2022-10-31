package org.avni.server.web.request;

import java.util.HashMap;
import java.util.Objects;

public class Msg91Request {

    private String authKey;
    private String templateId;
    private String mobile;
    private String otp;
    private String otpLength;
    private String otpExpiry;
    private String retryType;
    private String type;

    public String getAuthKey() {
        return authKey;
    }

    public void setAuthKey(String authKey) {
        this.authKey = authKey;
    }

    public String getTemplateId() {
        return templateId;
    }

    public void setTemplateId(String templateId) {
        this.templateId = templateId;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public String getOtpLength() {
        return otpLength;
    }

    public void setOtpLength(String otpLength) {
        this.otpLength = otpLength;
    }

    public String getOtpExpiry() {
        return otpExpiry;
    }

    public void setOtpExpiry(String otpExpiry) {
        this.otpExpiry = otpExpiry;
    }

    public String getRetryType() {
        return retryType;
    }

    public void setRetryType(String retryType) {
        this.retryType = retryType;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public HashMap<String, String> toMap() {
        HashMap<String, String> msg91RequestMap = new HashMap<>();
        msg91RequestMap.put("authkey", getAuthKey());
        msg91RequestMap.put("template_id", getTemplateId());
        msg91RequestMap.put("mobile", getMobile());
        msg91RequestMap.put("otp_length", getOtpLength());
        msg91RequestMap.put("otp_expiry", getOtpExpiry());
        msg91RequestMap.put("retrytype", getRetryType());
        msg91RequestMap.put("otp", getOtp());
        msg91RequestMap.put("type", getType());

        msg91RequestMap.values().removeIf(Objects::isNull);
        return msg91RequestMap;
    }

    @Override
    public String toString() {
        return "Msg91Request{" +
                "authKey='" + authKey.replaceAll(".(?=.{4})", "X") + '\'' +
                ", templateId='" + templateId + '\'' +
                ", mobile='" + mobile + '\'' +
                ", otp='" + otp + '\'' +
                ", otpLength='" + otpLength + '\'' +
                ", otpExpiry='" + otpExpiry + '\'' +
                ", retryType='" + retryType + '\'' +
                ", type='" + type + '\'' +
                '}';
    }
}
