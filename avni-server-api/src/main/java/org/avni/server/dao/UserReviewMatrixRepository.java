package org.avni.server.dao;

import org.avni.server.domain.User;
import org.avni.server.domain.UserReviewMatrix;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserReviewMatrixRepository extends JpaRepository<UserReviewMatrix, Long> {
    UserReviewMatrix findFirstByUserAndOrganisationId(User user, Long orgId);
}
