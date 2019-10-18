package org.openchs.importer.batch.model;

import java.util.HashMap;
import java.util.stream.IntStream;

public class Row extends HashMap<String, String> {

    private final String[] headers;

    public Row(String[] headers, String[] values) {
        this.headers = headers;
        IntStream.range(0, values.length).forEach(index -> this.put(headers[index], values[index]));
    }

    public String[] getHeaders() {
        return headers;
    }
}
