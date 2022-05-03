package org.avni.dao;

import org.avni.domain.User;
import org.avni.domain.UserSubjectAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;


@Repository
public interface UserSubjectAssignmentRepository extends JpaRepository<UserSubjectAssignment, Long> {
    @Modifying
    @Query(value = "delete from user_subject_assignment where user_id = :userId", nativeQuery = true)
    void deleteAllByUser(Long userId);
}
