package org.avni.server.web;

import org.avni.server.dao.UserReviewMatrixRepository;
import org.avni.server.domain.UserContext;
import org.avni.server.domain.UserReviewMatrix;
import org.avni.server.framework.security.UserContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserReviewMatrixController {

    private final UserReviewMatrixRepository userReviewMatrixRepository;

    @Autowired
    public UserReviewMatrixController(UserReviewMatrixRepository userReviewMatrixRepository) {
        this.userReviewMatrixRepository = userReviewMatrixRepository;
    }

    @RequestMapping(value = "/userMatrix", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public ResponseEntity<UserReviewMatrix> getUserReview() {
        UserContext userContext = UserContextHolder.getUserContext();
        UserReviewMatrix userMatrix = userReviewMatrixRepository.findFirstByUserAndOrganisationId(userContext.getUser(), userContext.getOrganisation().getId());
        if (userMatrix == null) {
            userMatrix = new UserReviewMatrix();
            userMatrix.setUser(userContext.getUser());
        }
        return ResponseEntity.ok().body(userMatrix);
    }

}
