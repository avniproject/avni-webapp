package org.avni.domain;

import javax.persistence.Entity;
import javax.persistence.Table;

@Entity
@Table(name = "video")
public class Video extends OrganisationAwareEntity {
    private String title;
    private String filePath;
    private String description;
    private Long duration;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getDuration() {
        return duration;
    }

    public void setDuration(Long duration) {
        this.duration = duration;
    }
}
