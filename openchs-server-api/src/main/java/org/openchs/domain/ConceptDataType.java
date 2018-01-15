package org.openchs.domain;

import java.util.Arrays;
import java.util.List;

public enum ConceptDataType {
    Numeric,
    @Deprecated
    Boolean,
    Text,
    Coded,
    NA,
    Date,
    Duration;

    private static List<ConceptDataType> stringTypes = Arrays.asList(Text, Coded);

    public static boolean stringType(String string) {
        return stringTypes.contains(ConceptDataType.valueOf(string));
    }
}
