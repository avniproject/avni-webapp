package org.openchs.framework.http;

import org.springframework.http.HttpInputMessage;
import org.springframework.http.HttpOutputMessage;
import org.springframework.http.MediaType;
import org.springframework.http.converter.AbstractHttpMessageConverter;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.http.converter.HttpMessageNotWritableException;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class OctetStreamMessageConverter extends AbstractHttpMessageConverter<Map> {
    public OctetStreamMessageConverter() {
        super(MediaType.APPLICATION_OCTET_STREAM);
    }

    @Override
    protected boolean supports(Class<?> clazz) {
        return clazz == Map.class;
    }

    @Override
    protected Map readInternal(Class<? extends Map> clazz, HttpInputMessage inputMessage) throws IOException, HttpMessageNotReadableException {
        return new HashMap<>();
    }

    @Override
    protected void writeInternal(Map map, HttpOutputMessage outputMessage) throws IOException, HttpMessageNotWritableException {

    }
}
