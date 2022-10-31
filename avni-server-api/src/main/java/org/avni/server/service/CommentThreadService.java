package org.avni.server.service;

import org.avni.server.dao.*;
import org.joda.time.DateTime;
import org.avni.server.domain.Comment;
import org.avni.server.domain.CommentThread;
import org.avni.server.web.request.CommentThreadContract;
import org.avni.server.domain.SubjectType;
import org.avni.server.domain.User;
import org.avni.server.framework.security.UserContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
public class CommentThreadService implements ScopeAwareService {

    private CommentThreadRepository commentThreadRepository;
    private IndividualRepository individualRepository;
    private SubjectTypeRepository subjectTypeRepository;

    @Autowired
    public CommentThreadService(CommentThreadRepository commentThreadRepository, IndividualRepository individualRepository, SubjectTypeRepository subjectTypeRepository) {
        this.commentThreadRepository = commentThreadRepository;
        this.individualRepository = individualRepository;
        this.subjectTypeRepository = subjectTypeRepository;
    }

    public CommentThread createNewThread(CommentThreadContract threadContract) {
        CommentThread commentThread = new CommentThread();
        commentThread.assignUUID();
        commentThread.setStatus(CommentThread.CommentThreadStatus.Open);
        commentThread.setOpenDateTime(new DateTime());
        Set<Comment> comments = new HashSet<>();
        threadContract.getComments().forEach(commentContract -> {
            Comment comment = new Comment();
            comment.assignUUID();
            comment.setText(commentContract.getText());
            comment.setSubject(individualRepository.findByUuid(commentContract.getSubjectUUID()));
            comment.setCommentThread(commentThread);
            commentThread.setComments(comments);
            comments.add(comment);
        });
        commentThread.setComments(comments);
        return commentThreadRepository.save(commentThread);
    }

    public CommentThread resolveThread(CommentThread commentThread) {
        commentThread.setStatus(CommentThread.CommentThreadStatus.Resolved);
        commentThread.setResolvedDateTime(new DateTime());
        return commentThreadRepository.save(commentThread);
    }

    @Override
    public boolean isScopeEntityChanged(DateTime lastModifiedDateTime, String subjectTypeUUID) {
        SubjectType subjectType = subjectTypeRepository.findByUuid(subjectTypeUUID);
        User user = UserContextHolder.getUserContext().getUser();
        return subjectType != null && isChangedBySubjectTypeRegistrationLocationType(user, lastModifiedDateTime, subjectType.getId(), subjectType, SyncParameters.SyncEntityName.CommentThread);
    }

    @Override
    public OperatingIndividualScopeAwareRepository repository() {
        return commentThreadRepository;
    }
}
