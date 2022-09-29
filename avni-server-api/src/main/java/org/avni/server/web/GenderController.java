package org.avni.server.web;

import org.avni.server.dao.GenderRepository;
import org.avni.server.domain.Gender;
import org.avni.server.domain.Gender.GenderProjection;
import org.avni.server.web.request.GenderContract;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.List;

@RestController
public class GenderController {

    private static Logger logger = org.slf4j.LoggerFactory.getLogger(GenderController.class);
    private GenderRepository genderRepository;
    private ProjectionFactory projectionFactory;

    @Autowired
    public GenderController(GenderRepository genderRepository, ProjectionFactory projectionFactory) {
        this.genderRepository = genderRepository;
        this.projectionFactory = projectionFactory;
    }

    @GetMapping("/web/gender")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @ResponseBody
    public Page<GenderProjection> getAll(Pageable pageable) {
        return genderRepository.findAll(pageable).map(g -> projectionFactory.createProjection(GenderProjection.class, g));
    }

    @RequestMapping(value = "/genders", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize("hasAnyAuthority('admin','organisation_admin')")
    void saveOrUpdate(@RequestBody List<GenderContract> genderContracts) {
        for (GenderContract genderContract : genderContracts) {
            saveOrUpdate(genderContract);
        }
    }

    public void saveOrUpdate(GenderContract genderContract) {
        logger.info(String.format("Saving form: %s, with UUID: %s", genderContract.getName(), genderContract.getUuid()));
        Gender existing = genderRepository.findByUuid(genderContract.getUuid());
        Gender gender = existing == null ? new Gender() : existing;
        gender.setUuid(genderContract.getUuid());
        gender.setName(genderContract.getName());
        gender.setVoided(genderContract.isVoided());
        genderRepository.save(gender);
    }
}
