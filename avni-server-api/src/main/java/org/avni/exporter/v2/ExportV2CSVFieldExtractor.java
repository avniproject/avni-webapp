package org.avni.exporter.v2;

import org.avni.domain.Individual;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.item.file.FlatFileHeaderCallback;
import org.springframework.batch.item.file.transform.FieldExtractor;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.Writer;

@Component
@StepScope
public class ExportV2CSVFieldExtractor implements FieldExtractor<Individual>, FlatFileHeaderCallback {

    @Override
    public void writeHeader(Writer writer) throws IOException {

    }

    @Override
    public Object[] extract(Individual individual) {

        return new Object[0];
    }
}
