package org.avni.service;

import org.avni.dao.CommentRepository;
import org.avni.dao.CommentThreadRepository;
import org.avni.dao.IndividualRepository;
import org.avni.domain.Comment;
import org.avni.domain.CommentThread;
import org.avni.web.request.CommentContract;

import org.joda.time.DateTime;
import org.avni.dao.*;
import org.avni.domain.SubjectType;
import org.avni.domain.User;
import org.avni.framework.security.UserContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CommentService implements ScopeAwareService {

    private final CommentRepository commentRepository;
    private final IndividualRepository individualRepository;
    private final CommentThreadRepository commentThreadRepository;
    private final SubjectTypeRepository subjectTypeRepository;

    @Autowired
    public CommentService(CommentRepository commentRepository, IndividualRepository individualRepository, CommentThreadRepository commentThreadRepository, SubjectTypeRepository subjectTypeRepository) {
        this.commentRepository = commentRepository;
        this.individualRepository = individualRepository;
        this.commentThreadRepository = commentThreadRepository;
        this.subjectTypeRepository = subjectTypeRepository;
    }


    public Comment saveComment(CommentContract commentContract) {
        Comment comment = new Comment();
        buildComment(commentContract, comment);
        return commentRepository.save(comment);
    }

    public Comment editComment(CommentContract commentContract, Comment existingComment) {
        buildComment(commentContract, existingComment);
        return commentRepository.save(existingComment);
    }

    private void buildComment(CommentContract commentContract, Comment comment) {
        comment.assignUUIDIfRequired();
        comment.setText(commentContract.getText());
        comment.setSubject(individualRepository.findByUuid(commentContract.getSubjectUUID()));
        CommentThread commentThread = commentThreadRepository.findByUuid(commentContract.getCommentThreadUUID());
        commentThread.setStatus(CommentThread.CommentThreadStatus.Open);
        commentThread.setResolvedDateTime(null);
        commentThread.updateAudit();
        comment.setCommentThread(commentThread);
    }

    public Comment deleteComment(Comment comment) {
        comment.setVoided(true);
        return commentRepository.save(comment);
    }

    @Override
    public boolean isScopeEntityChanged(DateTime lastModifiedDateTime, String subjectTypeUUID) {
        SubjectType subjectType = subjectTypeRepository.findByUuid(subjectTypeUUID);
        User user = UserContextHolder.getUserContext().getUser();
        return subjectType != null && isChanged(user, lastModifiedDateTime, subjectType.getId());
    }

    @Override
    public OperatingIndividualScopeAwareRepository repository() {
        return commentRepository;
    }
}
