package org.openchs.importer.batch.model;

import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class RowTest {

    @Test
    public void toStringShouldSerialiseProperly() throws Exception {
        assertEquals("1,2,3,4", new Row(new String[]{"A", "B", "C", "D"}, new String[]{"1", "2", "3", "4"}).toString());

        assertEquals("\"1\",2,3", new Row(new String[]{"A", "B", "D"}, new String[]{"\"1\"", "2", "3"}).toString());

        assertEquals("\"1,2,3\",2,3", new Row(new String[]{"A", "B", "D"}, new String[]{"\"1,2,3\"", "2", "3"}).toString());

        assertEquals("0,\"1,2,3\",2", new Row(new String[]{"A", "B", "D"}, new String[]{"0", "\"1,2,3\"", "2"}).toString());
    }
}