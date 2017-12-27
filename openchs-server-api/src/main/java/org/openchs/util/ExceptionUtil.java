package org.openchs.util;

public class ExceptionUtil {
    public static int getExceptionHash(Exception e) {
        StackTraceElement[] stackTrace = e.getStackTrace();
        StringBuffer stringBuffer = new StringBuffer();
        for (int i = 0; i < stackTrace.length; i++) {
            if (i == 0) {
                //not taking the toString of the first frame because it could contain the input data which would make the same stack trace non-unique
                stringBuffer.append(stackTrace[i].getClassName()).append(stackTrace[i].getMethodName()).append(stackTrace[i].getLineNumber());
            } else {
                stringBuffer.append(stackTrace[i].toString());
            }
        }
        return stringBuffer.toString().hashCode();
    }
}