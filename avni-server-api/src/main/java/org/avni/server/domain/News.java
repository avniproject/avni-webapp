package org.avni.server.domain;

import org.hibernate.annotations.BatchSize;
import org.joda.time.DateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "news")
@BatchSize(size = 100)
public class News extends OrganisationAwareEntity {
    @NotNull
    private String title;
    private DateTime publishedDate;
    private String heroImage;
    private String content;
    @Column(name = "contenthtml")
    private String contentHtml;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public DateTime getPublishedDate() {
        return publishedDate;
    }

    public void setPublishedDate(DateTime publishedDate) {
        this.publishedDate = publishedDate;
    }

    public String getHeroImage() {
        return heroImage;
    }

    public void setHeroImage(String heroImage) {
        this.heroImage = heroImage;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getContentHtml() {
        return contentHtml;
    }

    public void setContentHtml(String contentHtml) {
        this.contentHtml = contentHtml;
    }
}
