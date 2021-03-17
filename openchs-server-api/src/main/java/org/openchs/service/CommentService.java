package org.openchs.service;

import org.openchs.dao.CommentRepository;
import org.openchs.dao.IndividualRepository;
import org.openchs.domain.Comment;
import org.openchs.web.request.CommentContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final IndividualRepository individualRepository;

    @Autowired
    public CommentService(CommentRepository commentRepository, IndividualRepository individualRepository) {
        this.commentRepository = commentRepository;
        this.individualRepository = individualRepository;
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
    }

    public void deleteComment(Comment comment) {
        comment.setVoided(true);
        commentRepository.save(comment);
    }
}
