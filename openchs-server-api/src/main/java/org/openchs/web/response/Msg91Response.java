package org.openchs.web.response;

import java.io.Serializable;

public class Msg91Response implements Serializable {
    String type;
    String message;
    String request_id;
    String code;

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getRequest_id() {
        return request_id;
    }

    public void setRequest_id(String request_id) {
        this.request_id = request_id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    @Override
    public String toString() {
        return "Msg91Response{" +
                "type='" + type + '\'' +
                ", message='" + message + '\'' +
                ", request_id='" + request_id + '\'' +
                ", code='" + code + '\'' +
                '}';
    }
}
