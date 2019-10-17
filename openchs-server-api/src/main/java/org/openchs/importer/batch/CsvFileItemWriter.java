package org.openchs.importer.batch;

import org.openchs.framework.security.AuthService;
import org.openchs.importer.batch.model.Row;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static java.lang.String.format;

@Component
@StepScope
public class CsvFileItemWriter implements ItemWriter<Row> {

    private final AuthService authService;
    private final Map<String, ItemWriter<Row>> writers = new HashMap<>();

    @Value("#{jobParameters['userId']}")
    private Long userId;
    @Value("#{jobParameters['type']}")
    private String type;

    @Autowired
    public CsvFileItemWriter(AuthService authService, LocationWriter locationWriter) {
        this.authService = authService;
        writers.put("locations", locationWriter);
    }

    @Override
    public void write(List<? extends Row> rows) throws Exception {
        authService.authenticateByUserId(userId);
        if (writers.containsKey(type)) {
            writers.get(type).write(rows);
        } else {
            throw new RuntimeException(format("Unknown bulkupload type: '%s'", type));
        }
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}