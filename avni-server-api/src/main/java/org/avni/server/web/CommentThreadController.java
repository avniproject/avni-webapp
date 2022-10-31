package org.avni.server.web;

import org.avni.server.dao.CommentThreadRepository;
import org.avni.server.dao.IndividualRepository;
import org.avni.server.dao.SubjectTypeRepository;
import org.avni.server.dao.SyncParameters;
import org.avni.server.domain.CommentThread;
import org.avni.server.domain.Individual;
import org.avni.server.domain.SubjectType;
import org.avni.server.service.CommentThreadService;
import org.avni.server.service.ScopeBasedSyncService;
import org.avni.server.service.UserService;
import org.avni.server.web.response.CommentThreadResponse;
import org.avni.server.web.request.CommentThreadContract;
import org.joda.time.DateTime;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
public class CommentThreadController extends AbstractController<CommentThread> implements RestControllerResourceProcessor<CommentThread> {

    private static org.slf4j.Logger logger = LoggerFactory.getLogger(CommentThreadController.class);
    private final CommentThreadRepository commentThreadRepository;
    private final SubjectTypeRepository subjectTypeRepository;
    private final UserService userService;
    private final IndividualRepository individualRepository;
    private final CommentThreadService commentThreadService;
    private ScopeBasedSyncService<CommentThread> scopeBasedSyncService;

    @Autowired
    public CommentThreadController(CommentThreadRepository commentThreadRepository,
                                   SubjectTypeRepository subjectTypeRepository,
                                   UserService userService,
                                   IndividualRepository individualRepository,
                                   CommentThreadService commentThreadService, ScopeBasedSyncService<CommentThread> scopeBasedSyncService) {
        this.commentThreadRepository = commentThreadRepository;
        this.subjectTypeRepository = subjectTypeRepository;
        this.userService = userService;
        this.individualRepository = individualRepository;
        this.commentThreadService = commentThreadService;
        this.scopeBasedSyncService = scopeBasedSyncService;
    }

    @GetMapping(value = {"/commentThread"})
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public PagedResources<Resource<CommentThread>> getCommentThreadsByOperatingIndividualScope(
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            @RequestParam(value = "subjectTypeUuid") String subjectTypeUuid,
            Pageable pageable) {
        SubjectType subjectType = subjectTypeRepository.findByUuid(subjectTypeUuid);
        if (subjectType == null) {
            return wrap(new PageImpl<>(Collections.emptyList()));
        }
        return wrap(scopeBasedSyncService.getSyncResultsBySubjectTypeRegistrationLocation(commentThreadRepository, userService.getCurrentUser(), lastModifiedDateTime, now, subjectType.getId(), pageable, subjectType, SyncParameters.SyncEntityName.CommentThread));
    }

    @RequestMapping(value = "/commentThreads", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('user')")
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
    @PreAuthorize(value = "hasAnyAuthority('user','admin')")
    public List<CommentThreadResponse> getAllThreads(@RequestParam(value = "subjectUUID") String subjectUUID) {
        Individual subject = individualRepository.findByUuid(subjectUUID);
        return commentThreadRepository.findDistinctByIsVoidedFalseAndCommentsIsVoidedFalseAndComments_SubjectOrderByOpenDateTimeDescIdDesc(subject)
                .stream()
                .map(CommentThreadResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @RequestMapping(value = "/web/commentThread", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('user','admin')")
    public ResponseEntity<CommentThreadResponse> saveThread(@RequestBody CommentThreadContract threadContract) {
        CommentThread savedThread = commentThreadService.createNewThread(threadContract);
        return ResponseEntity.ok(CommentThreadResponse.fromEntity(savedThread));
    }

    @RequestMapping(value = "/web/commentThread/{id}/resolve", method = RequestMethod.PUT)
    @PreAuthorize(value = "hasAnyAuthority('user','admin')")
    public ResponseEntity<CommentThreadResponse> editThread(@PathVariable Long id) {
        Optional<CommentThread> commentThread = commentThreadRepository.findById(id);
        if (!commentThread.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        CommentThread resolvedCommentThread = commentThreadService.resolveThread(commentThread.get());
        return ResponseEntity.ok(CommentThreadResponse.fromEntity(resolvedCommentThread));
    }

}
