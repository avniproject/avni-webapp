package org.avni.excel.metadata;

import org.avni.server.excel.metadata.ImportCalculatedField;
import org.junit.Test;

import static org.junit.Assert.*;

public class ImportCalculatedFieldTest {
    @Test
    public void testFind() {
        assertEquals("ललिता  पिडाे", getActual("ललिता  पिडाे पुंगाटी", "\\w+\\s+\\w+"));
        assertEquals("John Doe", getActual("John Doe Danish", "\\w+\\s+\\w+"));
        assertEquals("३ दिवस\nपॅरासिटामॉल १ टॅबलेट दिवसातून तीन वेळा जेवणानंतर\n", getActual("३ दिवस\nपॅरासिटामॉल १ टॅबलेट दिवसातून तीन वेळा जेवणानंतर\n05/10/2016 18:56:56", "[^0-9:/]*"));
        assertEquals("३ दिवस\nपॅरासिटामॉल १ टॅबलेट दिवसातून तीन वेळा जेवणानंतर\n", getActual("३ दिवस\nपॅरासिटामॉल १ टॅबलेट दिवसातून तीन वेळा जेवणानंतर\n05/10/2016 18:56:56", "[^0-9:/]*"));
        assertEquals("80", getActual("80/50", "([0-9]+)(?:/[0-9]+)"));
        assertEquals("80", getActual("120/80", "(?:[0-9]+/)([0-9]+)"));
    }

    private String getActual(String name, String regex) {
        ImportCalculatedField iCalculatedField = new ImportCalculatedField();
        iCalculatedField.setRegex(regex);
        return iCalculatedField.find(name);
    }
}
