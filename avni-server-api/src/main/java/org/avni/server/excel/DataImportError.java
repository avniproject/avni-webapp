package org.avni.server.excel;

import org.avni.server.util.ExceptionUtil;

import java.util.*;

public class DataImportError {
    private Integer hash;
    private String message;
    private Exception exception;
    private Map<String, String> info;

    public DataImportError(Exception e, Map<String, String> info) {
        this.exception = e;
        this.hash = ExceptionUtil.getExceptionHash(e);
        this.message = e.getMessage();
        this.info = info;
    }

    public Integer getHash() {
        return hash;
    }

    public void setHash(Integer hash) {
        this.hash = hash;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Map<String, String> getInfo() {
        return info;
    }

    public void setInfo(Map<String, String> info) {
        this.info = info;
    }

    public Exception getException() {
        return exception;
    }

    public void setException(Exception exception) {
        this.exception = exception;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DataImportError that = (DataImportError) o;
        return Objects.equals(hash, that.hash);
    }



    @Override
    public int hashCode() {
        return Objects.hash(hash);
    }

    @Override
    public String toString() {
        StringBuilder stringBuilder = new StringBuilder();
        stringBuilder.append("Exception Details").append("\n");
        info.forEach((k, v) -> stringBuilder
                .append(k)
                .append(" : ")
                .append(v)
                .append("\n"));
        stringBuilder.append("Stacktrace").append("\n").append(exception.getMessage());
        return stringBuilder.toString();
    }
}
