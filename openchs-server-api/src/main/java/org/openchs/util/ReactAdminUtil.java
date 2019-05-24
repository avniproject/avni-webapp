package org.openchs.util;

import java.util.HashMap;
import java.util.Map;

public class ReactAdminUtil {
    public static Map<String, String> generateJsonError(String errorMsg) {
        Map<String, String> errorMap = new HashMap<>();
        errorMap.put("message", errorMsg);
        return errorMap;
    }
}
