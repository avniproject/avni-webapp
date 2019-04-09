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
    Time,
    Duration,
    Image,
    Id,
    Video;

    private static List<ConceptDataType> stringTypes = Arrays.asList(Text, Coded, Notes, Image, Video, Id);
    private static List<ConceptDataType> dateTypes = Arrays.asList(Date, DateTime,Duration,Time);

    public static boolean stringType(String string) {
        return stringTypes.contains(ConceptDataType.valueOf(string));
    }

    public static boolean dateType(String dataType) {
        return dateTypes.contains(ConceptDataType.valueOf(dataType));
    }
}
