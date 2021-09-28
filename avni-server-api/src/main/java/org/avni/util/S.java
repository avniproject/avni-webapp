package org.avni.util;

public class S {
    public static boolean isEmpty(String string) {
        return string == null || string.trim().isEmpty();
    }

    public static String getLastStringAfter(String originalString, String separator) {
        return originalString.substring(originalString.lastIndexOf(separator) + 1);
    }
}
