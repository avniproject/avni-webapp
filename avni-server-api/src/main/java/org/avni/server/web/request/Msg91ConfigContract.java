package org.avni.server.web.request;


import org.avni.server.domain.Msg91Config;

public class Msg91ConfigContract extends CHSRequest {
    private String authKey;

    private String otpSmsTemplateId;

    private Long otpLength;

    public String getAuthKey() {
        return authKey;
    }

    public void setAuthKey(String authKey) {
        this.authKey = authKey;
    }

    public String getOtpSmsTemplateId() {
        return otpSmsTemplateId;
    }

    public void setOtpSmsTemplateId(String otpSmsTemplateId) {
        this.otpSmsTemplateId = otpSmsTemplateId;
    }

    public Long getOtpLength() {
        return otpLength;
    }

    public void setOtpLength(Long otpLength) {
        this.otpLength = otpLength;
    }

    public static Msg91ConfigContract fromMsg91Config(Msg91Config msg91Config, String maskedAuthKey) {
        Msg91ConfigContract msg91ConfigContract = new Msg91ConfigContract();
        msg91ConfigContract.setUuid(msg91Config.getUuid());
        msg91ConfigContract.setAuthKey(maskedAuthKey != null ? maskedAuthKey : msg91Config.getAuthKey());
        msg91ConfigContract.setOtpLength(msg91Config.getOtpLength());
        msg91ConfigContract.setOtpSmsTemplateId(msg91Config.getOtpSmsTemplateId());
        msg91ConfigContract.setVoided(msg91Config.isVoided());
        return msg91ConfigContract;
    }
}
