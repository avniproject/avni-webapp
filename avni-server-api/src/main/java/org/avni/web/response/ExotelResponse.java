package org.avni.web.response;

public class ExotelResponse {
    private boolean isSuccess;

    public ExotelResponse(boolean isSuccess) {
        this.isSuccess = isSuccess;
    }

    public boolean isSuccess() {
        return isSuccess;
    }

    public void setSuccess(boolean success) {
        isSuccess = success;
    }
}
