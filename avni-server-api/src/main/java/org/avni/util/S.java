package org.avni.util;

import java.util.List;
import java.util.stream.Collectors;

public class S {
    public static boolean isEmpty(String string) {
        return string == null || string.trim().isEmpty();
    }

    public static String getLastStringAfter(String originalString, String separator) {
        return originalString.substring(originalString.lastIndexOf(separator) + 1);
    }

    public static String joinLongToList(List<Long> lists) {
        return lists.isEmpty() ? "" : lists.stream().map(String::valueOf)
                .collect(Collectors.joining(","));
    }
}
