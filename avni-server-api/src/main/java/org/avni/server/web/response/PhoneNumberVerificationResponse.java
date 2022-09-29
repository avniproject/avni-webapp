package org.avni.server.web.response;

public class PhoneNumberVerificationResponse {
    boolean success;
    Msg91Response msg91Response;

    public PhoneNumberVerificationResponse(boolean success, Msg91Response msg91Response) {
        this.success = success;
        this.msg91Response = msg91Response;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public Msg91Response getMsg91Response() {
        return msg91Response;
    }

    public void setMsg91Response(Msg91Response msg91Response) {
        this.msg91Response = msg91Response;
    }

}
