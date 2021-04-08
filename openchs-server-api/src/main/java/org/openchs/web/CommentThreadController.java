package org.openchs.web;

import org.joda.time.DateTime;
import org.openchs.dao.CommentThreadRepository;
import org.openchs.dao.IndividualRepository;
import org.openchs.dao.OperatingIndividualScopeAwareRepositoryWithTypeFilter;
import org.openchs.dao.SubjectTypeRepository;
import org.openchs.domain.CommentThread;
import org.openchs.domain.Individual;
import org.openchs.domain.SubjectType;
import org.openchs.service.UserService;
import org.openchs.web.request.CommentThreadContract;
import org.openchs.web.response.CommentThreadResponse;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@RestController
public class CommentThreadController extends AbstractController<CommentThread> implements RestControllerResourceProcessor<CommentThread>, OperatingIndividualScopeAwareFilterController<CommentThread> {

    private static org.slf4j.Logger logger = LoggerFactory.getLogger(CommentThreadController.class);
    private final CommentThreadRepository commentThreadRepository;
    private final SubjectTypeRepository subjectTypeRepository;
    private final UserService userService;
    private final IndividualRepository individualRepository;

    @Autowired
    public CommentThreadController(CommentThreadRepository commentThreadRepository,
                                   SubjectTypeRepository subjectTypeRepository,
                                   UserService userService,
                                   IndividualRepository individualRepository) {
        this.commentThreadRepository = commentThreadRepository;
        this.subjectTypeRepository = subjectTypeRepository;
        this.userService = userService;
        this.individualRepository = individualRepository;
    }

    @Override
    public OperatingIndividualScopeAwareRepositoryWithTypeFilter<CommentThread> repository() {
        return commentThreadRepository;
    }

    @GetMapping(value = {"/commentThread"})
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    public PagedResources<Resource<CommentThread>> getCommentThreadsByOperatingIndividualScope(
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            @RequestParam(value = "subjectTypeUuid") String subjectTypeUuid,
            Pageable pageable) {
        SubjectType subjectType = subjectTypeRepository.findByUuid(subjectTypeUuid);
        if (subjectType == null) {
            return wrap(new PageImpl<>(Collections.emptyList()));
        }
        return wrap(getCHSEntitiesForUserByLastModifiedDateTimeAndFilterByType(userService.getCurrentUser(), lastModifiedDateTime, now, subjectType.getId(), pageable));
    }

    @RequestMapping(value = "/commentThreads", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    public void save(@RequestBody CommentThreadContract commentThreadContract) {
        logger.info(String.format("Saving comment thread with UUID %s", commentThreadContract.getUuid()));
        CommentThread commentThread = newOrExistingEntity(commentThreadRepository, commentThreadContract, new CommentThread());
        commentThread.setOpenDateTime(commentThreadContract.getOpenDateTime());
        commentThread.setResolvedDateTime(commentThreadContract.getResolvedDateTime());
        commentThread.setStatus(CommentThread.CommentThreadStatus.valueOf(commentThreadContract.getStatus()));
        commentThread.setVoided(commentThreadContract.isVoided());
        commentThreadRepository.save(commentThread);
        logger.info(String.format("Saved comment thread with UUID %s", commentThreadContract.getUuid()));
    }

    @RequestMapping(value = "/web/commentThreads", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user','admin','organisation_admin')")
    public List<CommentThreadResponse> getAllThreads(@RequestParam(value = "subjectUUID") String subjectUUID) {
        Individual subject = individualRepository.findByUuid(subjectUUID);
        return commentThreadRepository.findDistinctByIsVoidedFalseAndCommentsIsVoidedFalseAndComments_SubjectOrderByOpenDateTimeDescIdDesc(subject)
                .stream()
                .map(CommentThreadResponse::fromEntity)
                .collect(Collectors.toList());
    }

}
