package org.avni.server.importer.batch.csv.writer;

import org.avni.server.framework.security.AuthService;
import org.avni.server.importer.batch.model.Row;
import org.springframework.batch.core.configuration.annotation.JobScope;
import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static java.lang.String.format;

@Component
@JobScope
public class CsvFileItemWriter implements ItemWriter<Row> {

    private final AuthService authService;
    private final Map<String, ItemWriter<Row>> writers = new HashMap<>();

    @Value("#{jobParameters['userId']}")
    private Long userId;
    @Value("#{jobParameters['organisationUUID']}")
    private String organisationUUID;
    @Value("#{jobParameters['type']}")
    private String type;

    @Autowired
    public CsvFileItemWriter(AuthService authService,
                             LocationWriter locationWriter,
                             UserAndCatchmentWriter userAndCatchmentWriter,
                             SubjectWriter subjectWriter,
                             ProgramEnrolmentWriter programEnrolmentWriter,
                             ProgramEncounterWriter programEncounterWriter,
                             EncounterWriter encounterWriter,
                             GroupSubjectWriter groupSubjectWriter) {
        this.authService = authService;
        writers.put("locations", locationWriter);
        writers.put("usersAndCatchments", userAndCatchmentWriter);
        writers.put("Subject", subjectWriter);
        writers.put("ProgramEnrolment", programEnrolmentWriter);
        writers.put("ProgramEncounter", programEncounterWriter);
        writers.put("Encounter", encounterWriter);
        writers.put("GroupMembers", groupSubjectWriter);
    }

    private ItemWriter<Row> getWriter() {
        String primaryType = type.split("---")[0];
        if (writers.containsKey(primaryType)) {
            return writers.get(primaryType);
        } else {
            throw new RuntimeException(format("Unknown bulk upload type: '%s'", primaryType));
        }
    }

    @Override
    public void write(List<? extends Row> rows) throws Exception {
        authService.authenticateByUserId(userId, organisationUUID);
        getWriter().write(rows);
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
