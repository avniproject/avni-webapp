package org.avni.web;

import org.joda.time.DateTime;
import org.avni.builder.VideoTelemetricBuilder;
import org.avni.dao.VideoRepository;
import org.avni.dao.VideoTelemetricRepository;
import org.avni.domain.Organisation;
import org.avni.domain.User;
import org.avni.domain.Video;
import org.avni.domain.VideoTelemetric;
import org.avni.framework.security.UserContextHolder;
import org.avni.web.request.VideoTelemetricContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;

@RestController
public class VideoTelemetricController implements RestControllerResourceProcessor<VideoTelemetric> {

    private final VideoRepository videoRepository;

    private final VideoTelemetricRepository videoTelemetricRepository;

    @Autowired
    public VideoTelemetricController(VideoRepository videoRepository, VideoTelemetricRepository videoTelemetricRepository) {
        this.videoRepository = videoRepository;
        this.videoTelemetricRepository = videoTelemetricRepository;
    }

    @RequestMapping(value = "/videotelemetrics", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize("hasAnyAuthority('user')")
    public void save(@RequestBody VideoTelemetricContract videoTelemetricContract) {
        videoTelemetricRepository.save(createVideoTelemetric(videoTelemetricContract));
    }

    @RequestMapping(value = "/videotelemetric", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public PagedResources<Resource<VideoTelemetric>> getEmpty(Pageable pageable) {
        return empty(pageable);
    }

    private VideoTelemetric createVideoTelemetric(VideoTelemetricContract contract) {
        VideoTelemetric existing = videoTelemetricRepository.findByUuid(contract.getUuid());
        VideoTelemetricBuilder builder = new VideoTelemetricBuilder(existing);
        Video video = videoRepository.findByUuid(contract.getVideoUUID());
        User user = UserContextHolder.getUserContext().getUser();
        Organisation organisation = UserContextHolder.getUserContext().getOrganisation();
        return builder
                .withUUID(contract.getUuid())
                .withPlayerOpenTime(contract.getPlayerOpenTime())
                .withPlayerCloseTime(contract.getPlayerCloseTime())
                .withVideoStartTime(contract.getVideoStartTime())
                .withVideoEndTime(contract.getVideoEndTime())
                .withUser(user)
                .withVideo(video)
                .withCreatedDatetime(new DateTime())
                .withOrganisationId(organisation.getId())
                .build();
    }
}
