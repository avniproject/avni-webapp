package org.avni.server.web.request;

import org.avni.server.domain.Video;
import org.avni.server.util.S;

public class VideoContract extends CHSRequest {
    private String title;
    private String filePath;
    private Long duration;
    private String description;
    private String fileName;

    public static VideoContract fromEntity(Video video) {
        VideoContract videoContract = new VideoContract();
        videoContract.setId(video.getId());
        videoContract.setUuid(video.getUuid());
        videoContract.setDescription(video.getDescription());
        videoContract.setDuration(video.getDuration());
        videoContract.setFileName(S.getLastStringAfter(video.getFilePath(), "/"));
        videoContract.setTitle(video.getTitle());
        videoContract.setVoided(video.isVoided());
        return videoContract;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

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

    public Long getDuration() {
        return duration;
    }

    public void setDuration(Long duration) {
        this.duration = duration;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
