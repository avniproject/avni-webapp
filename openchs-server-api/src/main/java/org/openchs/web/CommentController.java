package org.openchs.web;

import org.openchs.dao.CommentRepository;
import org.openchs.dao.IndividualRepository;
import org.openchs.domain.Comment;
import org.openchs.domain.Individual;
import org.openchs.service.CommentService;
import org.openchs.web.request.CommentContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Optional;

@RestController
public class CommentController extends AbstractController<Comment> implements RestControllerResourceProcessor<Comment> {

    private final CommentRepository commentRepository;
    private final IndividualRepository individualRepository;
    private final CommentService commentService;

    @Autowired
    public CommentController(CommentRepository commentRepository,
                             IndividualRepository individualRepository,
                             CommentService commentService) {
        this.commentRepository = commentRepository;
        this.individualRepository = individualRepository;
        this.commentService = commentService;
    }

    @GetMapping(value = "/web/comments")
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin','user')")
    @ResponseBody
    @Transactional
    public List<Comment> getCommentsForSubject(@RequestParam(value = "subjectUUID") String subjectUUID) {
        Individual individual = individualRepository.findByUuid(subjectUUID);
        return commentRepository.findByIsVoidedFalseAndSubjectOrderByAuditLastModifiedDateTimeAscIdAsc(individual);
    }

    @PostMapping(value = "/web/comment")
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin','user')")
    @ResponseBody
    @Transactional
    public ResponseEntity<Comment> createComment(@RequestBody CommentContract commentContract) {
        return ResponseEntity.ok(commentService.saveComment(commentContract));
    }

    @PutMapping(value = "/web/comment/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin','user')")
    @ResponseBody
    @Transactional
    public ResponseEntity<Comment> editComment(@PathVariable Long id, @RequestBody CommentContract commentContract) {
        Optional<Comment> comment = commentRepository.findById(id);
        if (!comment.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(commentService.editComment(commentContract, comment.get()));
    }

    @DeleteMapping(value = "/web/comment/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin','user')")
    @ResponseBody
    @Transactional
    public void deleteComment(@PathVariable Long id) {
        Optional<Comment> comment = commentRepository.findById(id);
        comment.ifPresent(commentService::deleteComment);
    }


}
