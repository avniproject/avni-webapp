package org.openchs.service;

import org.openchs.dao.VideoRepository;
import org.openchs.domain.Video;
import org.openchs.web.request.VideoContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class VideoService {

    private final VideoRepository videoRepository;

    @Autowired
    public VideoService(VideoRepository videoRepository) {
        this.videoRepository = videoRepository;
    }

    public List<VideoContract> getAllVideos() {
        return videoRepository.findAll()
                .stream()
                .map(VideoContract::fromEntity)
                .collect(Collectors.toList());
    }

    public Video saveVideo(VideoContract videoContract) {
        Video video = new Video();
        video.setUuid(videoContract.getUuid() == null ? UUID.randomUUID().toString() : videoContract.getUuid());
        return videoRepository.save(createVideo(videoContract, video));
    }

    public Video editVideo(VideoContract videoContract, Video video) {
        return videoRepository.save(createVideo(videoContract, video));
    }

    private Video createVideo(VideoContract videoContract, Video video) {
        video.setDescription(videoContract.getDescription());
        video.setDuration(videoContract.getDuration());
        String basePath = "/storage/emulated/0/OpenCHS/movies/";
        video.setFilePath(basePath.concat(videoContract.getFileName()));
        video.setTitle(videoContract.getTitle());
        video.setVoided(videoContract.isVoided());
        return video;
    }
}
