package org.openchs.domain;


import java.util.Arrays;
import java.util.List;

public enum ConceptDataType {
    Numeric,
    Text,
    Notes,
    Coded,
    NA,
    Date,
    DateTime,
    Duration;

    private static List<ConceptDataType> stringTypes = Arrays.asList(Text, Coded, Notes);

    public static boolean stringType(String string) {
        return stringTypes.contains(ConceptDataType.valueOf(string));
    }
}
