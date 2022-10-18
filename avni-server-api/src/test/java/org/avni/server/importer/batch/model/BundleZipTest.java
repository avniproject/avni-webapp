package org.avni.server.importer.batch.model;

import org.junit.Test;

import java.util.HashMap;
import java.util.List;

import static org.junit.Assert.*;

public class BundleZipTest {
    @Test
    public void getFile() {
        HashMap<String, byte[]> bundleEntries = new HashMap<>();
        bundleEntries.put("someParentFolder/programs.json", new byte[1]);
        bundleEntries.put("encounterTypes.json", new byte[1]);
        BundleZip bundleZip = new BundleZip(bundleEntries);
        assertNotNull(bundleZip.getFile("programs.json"));
        assertNotNull(bundleZip.getFile("encounterTypes.json"));
        assertNull(bundleZip.getFile("foo.json"));
        assertNull(bundleZip.getFile("someParentFolder"));
    }

    @Test
    public void getForms() {
        HashMap<String, byte[]> bundleEntries = new HashMap<>();
        bundleEntries.put("someParentFolder/programs.json", new byte[1]);
        bundleEntries.put("someParentFolder/forms/st1.json", new byte[8]);
        BundleZip bundleZip = new BundleZip(bundleEntries);
        List<String> forms = bundleZip.getForms();
        assertEquals(1, forms.size());
        assertEquals(8, forms.get(0).length());
    }
}
