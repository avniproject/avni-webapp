package org.avni.exporter.v2;

import org.avni.domain.Individual;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.stereotype.Component;

@Component
@StepScope
public class ExportV2Processor implements ItemProcessor<Object, Individual> {

    @Override
    public Individual process(Object o) throws Exception {
        return null;
    }

}
