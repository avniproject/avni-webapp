package org.avni.server.domain;

import org.hibernate.annotations.BatchSize;
import org.joda.time.DateTime;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "video_telemetric")
@BatchSize(size = 100)
public class VideoTelemetric extends CHSBaseEntity {

    //the video progress time
    //start time
    @Column(name = "video_start_time")
    private Double videoStartTime;

    //the video progress time
    //end time
    @Column(name = "video_end_time")
    private Double videoEndTime;

    @Column(name = "player_close_time")
    private DateTime playerCloseTime;

    @Column(name = "player_open_time")
    private DateTime playerOpenTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @NotNull
    @JoinColumn(name = "video_id")
    private Video video;

    @ManyToOne(fetch = FetchType.LAZY)
    @NotNull
    @JoinColumn(name = "user_id")
    private User user;

    @Column
    private Long organisationId;

    @Column(name="created_datetime")
    private DateTime createdDatetime;

    public Double getVideoStartTime() {
        return videoStartTime;
    }

    public void setVideoStartTime(Double videoStartTime) {
        this.videoStartTime = videoStartTime;
    }

    public Double getVideoEndTime() {
        return videoEndTime;
    }

    public void setVideoEndTime(Double videoEndTime) {
        this.videoEndTime = videoEndTime;
    }

    public DateTime getPlayerCloseTime() {
        return playerCloseTime;
    }

    public void setPlayerCloseTime(DateTime playerCloseTime) {
        this.playerCloseTime = playerCloseTime;
    }

    public DateTime getPlayerOpenTime() {
        return playerOpenTime;
    }

    public void setPlayerOpenTime(DateTime playerOpenTime) {
        this.playerOpenTime = playerOpenTime;
    }

    public Video getVideo() {
        return video;
    }

    public void setVideo(Video video) {
        this.video = video;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Long getOrganisationId() {
        return organisationId;
    }

    public void setOrganisationId(Long organisationId) {
        this.organisationId = organisationId;
    }

    public DateTime getCreatedDatetime() {
        return createdDatetime;
    }

    public void setCreatedDatetime(DateTime createdDatetime) {
        this.createdDatetime = createdDatetime;
    }
}
