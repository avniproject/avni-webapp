package org.avni.server.util;

public class ExceptionUtil {
    public static int getExceptionHash(Exception e) {
        StackTraceElement[] stackTrace = e.getStackTrace();
        StringBuilder stringBuilder = new StringBuilder();
        for (int i = 0; i < stackTrace.length; i++) {
            //not taking the toString of the first frame because it could contain the input data which would make the same stack trace non-unique
            if (i != 0) {
                stringBuilder.append(stackTrace[i].toString());
            }
        }
        return stringBuilder.toString().hashCode();
    }
}
