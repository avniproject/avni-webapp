package org.avni.messaging.contract.glific;

import org.avni.messaging.contract.glific.GlificError;

import java.util.List;

public class GlificResponse<T> {
    private T data;
    private List<GlificError> errors;

    public GlificResponse() {
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    public List<GlificError> getErrors() {
        return errors;
    }

    public void setErrors(List<GlificError> errors) {
        this.errors = errors;
    }

    public boolean hasErrors() {
        return this.getErrors() != null && this.getErrors().size() > 0;
    }

    @Override
    public String toString() {
        return "GlificResponse{" +
                "data=" + data +
                ", errors=" + errors +
                '}';
    }
}
