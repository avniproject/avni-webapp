package org.openchs.service;

import org.joda.time.DateTime;
import org.openchs.dao.CommentThreadRepository;
import org.openchs.dao.IndividualRepository;
import org.openchs.domain.Comment;
import org.openchs.domain.CommentThread;
import org.openchs.web.request.CommentThreadContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
public class CommentThreadService {

    private CommentThreadRepository commentThreadRepository;
    private IndividualRepository individualRepository;

    @Autowired
    public CommentThreadService(CommentThreadRepository commentThreadRepository, IndividualRepository individualRepository) {
        this.commentThreadRepository = commentThreadRepository;
        this.individualRepository = individualRepository;
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
}
