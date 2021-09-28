package org.avni.util;

import org.junit.Test;

import java.util.Arrays;
import java.util.List;

import static org.junit.Assert.*;

public class OTest {
    @Test
    public void getFullPath() throws Exception {
        String fullPath = O.getFullPath("external");
        assertEquals(fullPath, true, fullPath.startsWith("file:///"));
        assertEquals(fullPath, true, fullPath.endsWith("/"));
    }

    @Test
    public void some() {
        List<Integer> some = (List<Integer>) O.coalesce(null, null, Arrays.asList(1, 2, 3));
        assertEquals(3, some.size());
        some = (List<Integer>) O.coalesce(Arrays.asList(1), null, Arrays.asList(1, 2, 3));
        assertEquals(1, some.size());
    }

}
