package org.openchs.web;

import org.openchs.dao.CatchmentRepository;
import org.openchs.domain.Catchment;
import org.openchs.domain.Organisation;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.web.request.UserInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserInfoController {

    private final CatchmentRepository catchmentRepository;
    private final Logger logger;

    @Autowired
    public UserInfoController(CatchmentRepository catchmentRepository) {
        this.catchmentRepository = catchmentRepository;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @RequestMapping(value = "/userInfo", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
    public ResponseEntity<UserInfo> getUserInfo(@RequestParam(value = "catchmentId", required = true) Integer catchmentId) {

        Catchment catchment = this.catchmentRepository.findOne(Long.valueOf(catchmentId));
        Organisation organisation = UserContextHolder.getUserContext().getOrganisation();

        if (catchment == null){
            logger.info(String.format("Catchment not found for ID: %s", catchmentId));
            return new ResponseEntity<>(new UserInfo(null, null), HttpStatus.NOT_FOUND);
        }
        if (organisation == null){
            logger.info(String.format("Organisation not found for catchment ID: %s", catchmentId));
            return new ResponseEntity<>(new UserInfo(null, null), HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(new UserInfo(catchment.getType(), organisation.getName()), HttpStatus.OK);
    }
}
