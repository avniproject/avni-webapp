package org.openchs.web;

import org.openchs.builder.VideoBuilder;
import org.openchs.domain.Video;
import org.openchs.web.request.VideoContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;
import java.util.Arrays;

@RestController
public class VideoController {

    private final VideoRepository videoRepository;

    @Autowired
    public VideoController(VideoRepository videoRepository) {
        this.videoRepository = videoRepository;
    }

    @RequestMapping(value = "/videos", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize("hasAnyAuthority('admin','organisation_admin')")
    public void save(@RequestBody VideoContract[] videoContracts) {
        Arrays.stream(videoContracts).map(this::createVideo).forEach(videoRepository::save);
    }

    private Video createVideo(VideoContract contract) {
        Video existing = videoRepository.findByUuid(contract.getUuid());
        VideoBuilder builder = new VideoBuilder(existing);
        return builder
                .withUUID(contract.getUuid())
                .withTitle(contract.getTitle())
                .withFilePath(contract.getFilePath())
                .withDescription(contract.getDescription())
                .withDuration(contract.getDuration())
                .build();
    }
}
