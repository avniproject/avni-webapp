package org.avni.dao;

import org.avni.domain.User;
import org.avni.domain.UserReviewMatrix;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserReviewMatrixRepository extends JpaRepository<UserReviewMatrix, Long> {
    UserReviewMatrix findFirstByUserAndOrganisationId(User user, Long orgId);
}
