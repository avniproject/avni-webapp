package org.avni.server.web.request;

import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

public class ExotelRequest {

    private String from;
    private String to;
    private String callerId;
    private String callType;

    public ExotelRequest(String from, String to, String callerId) {
        this.from = from;
        this.to = to;
        this.callerId = callerId;
        this.callType = "trans";
    }

    public String getFrom() {
        return from;
    }

    public void setFrom(String from) {
        this.from = from;
    }

    public String getTo() {
        return to;
    }

    public void setTo(String to) {
        this.to = to;
    }

    public String getCallerId() {
        return callerId;
    }

    public void setCallerId(String callerId) {
        this.callerId = callerId;
    }

    public String getCallType() {
        return callType;
    }

    public void setCallType(String callType) {
        this.callType = callType;
    }

    public MultiValueMap<String, String> toMap() {
        MultiValueMap<String, String> exotelRequestMap = new LinkedMultiValueMap<String, String>();

        exotelRequestMap.add("From", from);
        exotelRequestMap.add("To", to);
        exotelRequestMap.add("CallerId", callerId);
        exotelRequestMap.add("CallType", callType);

        return exotelRequestMap;
    }

    @Override
    public String toString() {
        return "ExotelRequest{" +
                "from='" + from + '\'' +
                ", to='" + to + '\'' +
                ", callerId='" + callerId + '\'' +
                ", callType='" + callType + '\'' +
                '}';
    }
}
