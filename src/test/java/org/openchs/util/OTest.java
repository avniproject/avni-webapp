package org.openchs.util;

import org.junit.Test;

import static org.junit.Assert.*;

public class OTest {
    @Test
    public void getFullPath() throws Exception {
        String fullPath = O.getFullPath("external");
        assertEquals(fullPath,true, fullPath.startsWith("file:///"));
        assertEquals(fullPath,true, fullPath.endsWith("/"));
    }
}