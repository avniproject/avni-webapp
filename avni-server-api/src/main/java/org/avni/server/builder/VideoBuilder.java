package org.avni.server.builder;

import org.avni.server.domain.Video;

public class VideoBuilder extends BaseBuilder<Video, VideoBuilder> {

    public VideoBuilder(Video existingEntity) {
        super(existingEntity, new Video());
    }

    public VideoBuilder withTitle(String title) {
        set(get()::setTitle, title);
        return this;
    }

    public VideoBuilder withDescription(String description) {
        set(get()::setDescription, description);
        return this;
    }

    public VideoBuilder withDuration(Long duration) {
        set(get()::setDuration, duration);
        return this;
    }

    public VideoBuilder withFilePath(String filePath) {
        set(get()::setFilePath, filePath);
        return this;
    }
}
