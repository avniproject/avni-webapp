package org.avni.server.service;

import java.io.Serializable;

public class ObjectInfo implements Serializable {
    private String key;
    private Long noOfLines;

    public ObjectInfo(String key, Long noOfLines) {
        this.key = key;
        this.noOfLines = noOfLines;
    }

    public String getKey() {
        return key;
    }

    public Long getNoOfLines() {
        return noOfLines;
    }

}
