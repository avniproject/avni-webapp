package org.avni.server.util;

import org.avni.server.util.O;
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

    @Test
    public void testStringFormatWithNull() {
        Request request = new Request("123", null);
        System.out.println(
                String.format("Individual not found with UUID '%s' or External ID '%s'", request.getSubjectId(), request.getSubjectExternalId()));

    }

    class Request {
        String subjectId, subjectExternalId;

        public Request(String subjectId, String subjectExternalId) {
            this.subjectId = subjectId;
            this.subjectExternalId = subjectExternalId;
        }

        public String getSubjectId() {
            return subjectId;
        }

        public void setSubjectId(String subjectId) {
            this.subjectId = subjectId;
        }

        public String getSubjectExternalId() {
            return subjectExternalId;
        }

        public void setSubjectExternalId(String subjectExternalId) {
            this.subjectExternalId = subjectExternalId;
        }
    }

}
