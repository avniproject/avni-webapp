package org.avni.dao;

import org.avni.domain.User;
import org.avni.domain.UserSubjectAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;


@Repository
public interface UserSubjectAssignmentRepository extends JpaRepository<UserSubjectAssignment, Long> {

    List<UserSubjectAssignment> findAllByUserAndSubjectIdNotInAndIsVoidedFalse(User user, Set<Long> subjectIds);

    List<UserSubjectAssignment> findAllByUserAndSubjectIdInAndIsVoidedFalse(User user, Set<Long> subjectIds);
}
