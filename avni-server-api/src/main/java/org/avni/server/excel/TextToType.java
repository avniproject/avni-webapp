package org.avni.server.excel;

import java.util.HashMap;
import java.util.Map;

public class TextToType {
    private static Map<String, Boolean> booleanMap = new HashMap<String, Boolean>();
    private static Map<String, String> genderMap = new HashMap<String, String>();

    static {
        booleanMap.put("yes", true);
        booleanMap.put("true", true);
        booleanMap.put("positive", true);
        booleanMap.put("no", false);
        booleanMap.put("false", false);
        booleanMap.put("negative", false);
    }

    static {
        genderMap.put("male", "Male");
        genderMap.put("female", "Female");
        genderMap.put("other", "Other");
        genderMap.put("m", "Male");
        genderMap.put("f", "Female");
        genderMap.put("o", "Other");
    }

    public static boolean toBoolean(String str) {
        return booleanMap.get(str.toLowerCase());
    }

    public static String toGender(String str) {
        return genderMap.get(str.toLowerCase());
    }
}
