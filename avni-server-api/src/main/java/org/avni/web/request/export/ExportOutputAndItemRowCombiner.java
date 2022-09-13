package org.avni.web.request.export;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class ExportOutputAndItemRowCombiner {
    private CSVRowEntityType individual;
    private List<CSVRowEntityType> encounters = new ArrayList<>();
    private List<CSVRowEntityTypeWithChildren> groups = new ArrayList<>();
    private List<CSVRowEntityTypeWithChildren> programs = new ArrayList<>();

    private class CSVRowEntityType {
        private String entityType;
        private long noOfFields;;
        private long repeatCount;

        public String getEntityType() {
            return entityType;
        }

        public void setEntityType(String entityType) {
            this.entityType = entityType;
        }

        public long getNoOfFields() {
            return this.noOfFields;
        }

        public void setNoOfFields(long noOfFields) {
            this.noOfFields = noOfFields;
        }

        public long getRepeatCount() {
            return repeatCount;
        }

        public void setRepeatCount(long repeatCount) {
            this.repeatCount = repeatCount;
        }

        public long getTotalNumberOfColumns() {
            return getNoOfFields() * getRepeatCount();
        }
    }

    private class CSVRowEntityTypeWithChildren extends CSVRowEntityType {
        private List<CSVRowEntityType> children;

        public List<CSVRowEntityType> getChildren() {
            return children;
        }

        public void setChildren(List<CSVRowEntityType> children) {
            this.children = children;
        }

        public long getTotalNumberOfColumns() {
            return super.getTotalNumberOfColumns() + Optional.ofNullable(children).orElse(new ArrayList<>())
                    .stream().mapToLong(entry -> entry.getTotalNumberOfColumns()).sum();
        }
    }
}
