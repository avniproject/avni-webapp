package org.avni.exporter.v2;

import org.avni.util.ObjectMapperSingleton;
import org.avni.web.request.export.ExportOutput;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.stream.Collectors;

import static org.junit.Assert.assertEquals;

public class ExportV2ValidationHelperTest {

    private static final Logger logger = LoggerFactory.getLogger(ExportV2ValidationHelperTest.class);

    public ExportOutput readJson(String name) {
        InputStream inJson = ExportOutput.class.getResourceAsStream(name);
        try {
            ExportOutput exportOutput = ObjectMapperSingleton.getObjectMapper().readValue(inJson, ExportOutput.class);
            return exportOutput;
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    public void validateCorrectRequest() {
        assertEquals(new ExportV2ValidationHelper().validate(readJson("/exportRequest.json")).isEmpty(), true);
    }

    @Test
    public void validateErrorRequest() {
        List<String> errors = new ExportV2ValidationHelper().validate(readJson("/exportErrorRequest.json"));
        assertEquals(errors.isEmpty(), false);
        logger.error(errors.stream().collect(Collectors.joining(",")));
    }
}
