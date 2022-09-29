package org.avni.server.web;

import org.avni.server.dao.individualRelationship.IndividualRelationshipTypeRepository;
import org.avni.server.domain.individualRelationship.IndividualRelationshipType;
import org.avni.server.service.IndividualRelationshipTypeService;
import org.avni.server.web.request.IndividualRelationshipTypeContract;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.List;

@RestController
public class IndividualRelationshipTypeController {

    private IndividualRelationshipTypeRepository individualRelationshipTypeRepository;
    private IndividualRelationshipTypeService individualRelationshipTypeService;

    public IndividualRelationshipTypeController(IndividualRelationshipTypeRepository individualRelationshipTypeRepository,
                                                IndividualRelationshipTypeService individualRelationshipTypeService) {
        this.individualRelationshipTypeRepository = individualRelationshipTypeRepository;
        this.individualRelationshipTypeService = individualRelationshipTypeService;
    }

    @GetMapping(value = "/web/relationshipType")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'user')")
    @ResponseBody
    public List<IndividualRelationshipTypeContract> getAllIndividualRelationshipTypes() {
        return individualRelationshipTypeService.getAllRelationshipTypes();
    }

    @PostMapping(value = "/web/relationshipType")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @ResponseBody
    @Transactional
    public ResponseEntity<IndividualRelationshipTypeContract> newRelationshipType(@RequestBody IndividualRelationshipTypeContract relationshipTypeContract) {
        IndividualRelationshipType individualRelationshipType = individualRelationshipTypeService.saveRelationshipType(relationshipTypeContract);
        return ResponseEntity.ok(IndividualRelationshipTypeContract.fromEntity(individualRelationshipType));
    }

    @DeleteMapping(value = "/web/relationshipType/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @ResponseBody
    @Transactional
    public void deleteIndividualRelationshipType(@PathVariable Long id) {
        IndividualRelationshipType individualRelationshipType = individualRelationshipTypeRepository.findOne(id);
        if (individualRelationshipType != null) {
            individualRelationshipType.setVoided(true);
            individualRelationshipTypeRepository.save(individualRelationshipType);
        }
    }
}
