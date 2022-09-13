package org.avni.web.request.export;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ExportOutput extends ExportEntityType {
    private List<ExportEntityType> encounters = new ArrayList<>();
    private List<ExportNestedOutput> groups = new ArrayList<>();
    private List<ExportNestedOutput> programs = new ArrayList<>();

    public List<ExportEntityType> getEncounters() {
        return encounters;
    }

    public void setEncounters(List<ExportEntityType> encounters) {
        this.encounters = encounters;
    }

    public List<ExportNestedOutput> getGroups() {
        return groups;
    }

    public void setGroups(List<ExportNestedOutput> groups) {
        this.groups = groups;
    }

    public List<ExportNestedOutput> getPrograms() {
        return programs;
    }

    public void setPrograms(List<ExportNestedOutput> programs) {
        this.programs = programs;
    }

    public static class ExportNestedOutput extends ExportEntityType {
        private List<ExportEntityType> encounters = new ArrayList<>();

        public List<ExportEntityType> getEncounters() {
            return encounters;
        }

        public void setEncounters(List<ExportEntityType> encounters) {
            this.encounters = encounters;
        }

        public long getTotalNumberOfColumns() {
            return super.getTotalNumberOfColumns() + Optional.ofNullable(encounters).orElse(new ArrayList<>())
                    .stream().mapToLong(entry -> entry.getTotalNumberOfColumns()).sum();
        }
    }
}
