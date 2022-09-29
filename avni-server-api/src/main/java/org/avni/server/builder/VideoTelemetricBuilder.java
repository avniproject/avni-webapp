package org.avni.server.builder;

import org.joda.time.DateTime;
import org.avni.server.domain.User;
import org.avni.server.domain.Video;
import org.avni.server.domain.VideoTelemetric;

public class VideoTelemetricBuilder extends BaseBuilder<VideoTelemetric, VideoTelemetricBuilder> {
    public VideoTelemetricBuilder(VideoTelemetric existing) {
        super(existing, new VideoTelemetric());
    }

    public VideoTelemetricBuilder withPlayerOpenTime(DateTime playerOpenTime) {
        set(get()::setPlayerOpenTime, playerOpenTime);
        return this;
    }

    public VideoTelemetricBuilder withPlayerCloseTime(DateTime playerCloseTime) {
        set(get()::setPlayerCloseTime, playerCloseTime);
        return this;
    }

    public VideoTelemetricBuilder withVideoStartTime(Double videoStartTime) {
        set(get()::setVideoStartTime, videoStartTime);
        return this;
    }

    public VideoTelemetricBuilder withVideoEndTime(Double videoEndTime) {
        set(get()::setVideoEndTime, videoEndTime);
        return this;
    }

    public VideoTelemetricBuilder withUser(User user) {
        set(get()::setUser, user);
        return this;
    }

    public VideoTelemetricBuilder withVideo(Video video) {
        set(get()::setVideo, video);
        return this;
    }

    public VideoTelemetricBuilder withCreatedDatetime(DateTime dateTime) {
        if (get().getCreatedDatetime() == null) {
            set(get()::setCreatedDatetime, dateTime);
        }
        return this;
    }

    public VideoTelemetricBuilder withOrganisationId(Long organisationId) {
        set(get()::setOrganisationId, organisationId);
        return this;
    }
}
