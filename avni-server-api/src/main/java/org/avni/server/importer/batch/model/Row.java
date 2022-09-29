package org.avni.server.importer.batch.model;

import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.regex.Pattern;
import java.util.stream.IntStream;

import static java.lang.String.format;

public class Row extends HashMap<String, String> {

    public static final Pattern TRUE_VALUE = Pattern.compile("y|yes|true|1", Pattern.CASE_INSENSITIVE);
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
        return Arrays.stream(headers)
                .map(header -> format("\"%s\"", get(header) != null ? get(header) : ""))
                .reduce((c1, c2) -> format("%s,%s", c1, c2))
                .get();
    }

    public Boolean getBool(String header) {
        return TRUE_VALUE.matcher(String.valueOf(get(header))).matches();
    }
}
