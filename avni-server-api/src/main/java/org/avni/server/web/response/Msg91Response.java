package org.avni.server.web.response;

import java.io.Serializable;

public class Msg91Response implements Serializable {
    public enum responseTypes {
        success,
        error
    }

    //https://help.msg91.com/article/67-what-are-the-reason-for-error-codes-received
    String type;                //success/error
    String msgType;             //success/error
    String code;                //error codes
    String msg;                 //error codes
    String message;             //descriptive text
    String request_id;          //received for send otp call

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

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public String getMsgType() {
        return msgType;
    }

    public void setMsgType(String msgType) {
        this.msgType = msgType;
    }

    @Override
    public String toString() {
        return "Msg91Response{" +
                "type='" + type + '\'' +
                ", message='" + message + '\'' +
                ", request_id='" + request_id + '\'' +
                ", code='" + code + '\'' +
                ", msg='" + msg + '\'' +
                ", msgType='" + msgType + '\'' +
                '}';
    }
}
