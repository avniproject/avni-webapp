package org.avni.server.web.request;

import org.joda.time.DateTime;

public class VideoTelemetricContract {
    private String uuid;
    private Double videoStartTime;
    private Double videoEndTime;
    private DateTime playerOpenTime;
    private DateTime playerCloseTime;
    private String videoUUID;

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

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

    public DateTime getPlayerOpenTime() {
        return playerOpenTime;
    }

    public void setPlayerOpenTime(DateTime playerOpenTime) {
        this.playerOpenTime = playerOpenTime;
    }

    public DateTime getPlayerCloseTime() {
        return playerCloseTime;
    }

    public void setPlayerCloseTime(DateTime playerCloseTime) {
        this.playerCloseTime = playerCloseTime;
    }

    public String getVideoUUID() {
        return videoUUID;
    }

    public void setVideoUUID(String videoUUID) {
        this.videoUUID = videoUUID;
    }

}
