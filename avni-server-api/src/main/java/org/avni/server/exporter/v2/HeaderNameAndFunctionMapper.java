package org.avni.server.exporter.v2;

import java.util.function.Function;

public class HeaderNameAndFunctionMapper<T> {

    private String name;
    private Function<T, ?> valueFunction;

    public HeaderNameAndFunctionMapper(String name, Function<T, ?> valueFunction) {
        this.name = name;
        this.valueFunction = valueFunction;
    }

    public String getName() {
        return name;
    }

    public Function<T, ?> getValueFunction() {
        return valueFunction;
    }
}
