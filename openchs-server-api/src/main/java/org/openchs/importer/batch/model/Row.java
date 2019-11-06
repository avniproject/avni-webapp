package org.openchs.importer.batch.model;

import java.util.Arrays;
import java.util.HashMap;
import java.util.stream.IntStream;

import static java.lang.String.format;

public class Row extends HashMap<String, String> {

    private final String[] headers;

    public Row(String[] headers, String[] values) {
        this.headers = headers;
        IntStream.range(0, values.length).forEach(index -> this.put(headers[index], values[index]));
    }

    public String[] getHeaders() {
        return headers;
    }

    @Override
    public String toString() {
        return Arrays.stream(headers).map(this::get).map(v-> "\"" + v + "\"").reduce((c1, c2) -> format("%s,%s", c1, c2)).get();
    }
}
