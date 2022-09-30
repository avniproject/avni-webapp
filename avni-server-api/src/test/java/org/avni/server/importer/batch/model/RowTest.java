package org.avni.server.importer.batch.model;

import org.avni.server.importer.batch.model.Row;
import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class RowTest {

    @Test
    public void toStringShouldSerialiseProperly() throws Exception {
        String[] headers = {"A", "B"};
        assertEquals("\"AA\",\"\"", new Row(headers, new String[]{"AA"}).toString());

        assertEquals("\"AA\",\"BB\"", new Row(headers, new String[]{"AA", "BB"}).toString());

        assertEquals("\"AB, CD\",\"BB, EE\"", new Row(headers, new String[]{"AB, CD", "BB, EE"}).toString());
    }
}
