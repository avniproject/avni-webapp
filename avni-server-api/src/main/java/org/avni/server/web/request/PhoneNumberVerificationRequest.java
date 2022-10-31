package org.avni.server.web.request;

public class PhoneNumberVerificationRequest {
    String phoneNumber;
    String otp;
    String otpLength;

    public PhoneNumberVerificationRequest(String phoneNumber, String otp, String otpLength) {
        this.phoneNumber = phoneNumber;
        this.otp = otp;
        this.otpLength = otpLength;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
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
}
