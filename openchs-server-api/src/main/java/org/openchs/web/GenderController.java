package org.openchs.web;

import org.openchs.dao.GenderRepository;
import org.openchs.domain.Gender.GenderProjection;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class GenderController {

    private GenderRepository genderRepository;
    private ProjectionFactory projectionFactory;

    @Autowired
    public GenderController(GenderRepository genderRepository, ProjectionFactory projectionFactory) {
        this.genderRepository = genderRepository;
        this.projectionFactory = projectionFactory;
    }

    @GetMapping("/web/gender")
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    @ResponseBody
    public Page<GenderProjection> getAll(Pageable pageable) {
        return genderRepository.findAll(pageable).map(g -> projectionFactory.createProjection(GenderProjection.class, g));
    }
}
