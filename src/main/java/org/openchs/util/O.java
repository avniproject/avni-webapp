package org.openchs.util;

import java.io.File;

public class O {
    public static String getFullPath(String relativePath) {
        return String.format("file:///%s/", new File(relativePath).getAbsolutePath());
    }
}