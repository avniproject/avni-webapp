package org.avni.server.web;

import org.avni.server.dao.individualRelationship.IndividualRelationRepository;
import org.avni.server.domain.individualRelationship.IndividualRelation;
import org.avni.server.service.IndividualRelationService;
import org.avni.server.web.request.IndividualRelationContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Optional;

@RestController
public class IndividualRelationController {

    private IndividualRelationRepository individualRelationRepository;
    private IndividualRelationService individualRelationService;

    @Autowired
    public IndividualRelationController(IndividualRelationRepository individualRelationRepository,
                                        IndividualRelationService individualRelationService) {
        this.individualRelationRepository = individualRelationRepository;
        this.individualRelationService = individualRelationService;
    }

    @GetMapping(value = "/web/relation")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @ResponseBody
    public List<IndividualRelationContract> getAllIndividualRelations() {
        return individualRelationService.getAll();
    }

    @GetMapping(value = "/web/relation/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @ResponseBody
    public ResponseEntity<IndividualRelationContract> getIndividualRelation(@PathVariable Long id) {
        Optional<IndividualRelation> relation = individualRelationRepository.findById(id);
        return relation.map(individualRelation ->
                ResponseEntity.ok(individualRelationService.toResponseObject(individualRelation)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping(value = "/web/relation")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @ResponseBody
    @Transactional
    public ResponseEntity<IndividualRelationContract> newIndividualRelation(@RequestBody IndividualRelationContract individualRelationContract) {
        IndividualRelation relation = individualRelationService.saveRelation(individualRelationContract);
        return ResponseEntity.ok(individualRelationService.toResponseObject(relation));
    }

    @PostMapping(value = "/web/relation/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @ResponseBody
    @Transactional
    public ResponseEntity saveIndividualRelation(@PathVariable Long id, @RequestBody IndividualRelationContract individualRelationContract) {
        Optional<IndividualRelation> relation = individualRelationRepository.findById(id);
        if (!relation.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        IndividualRelation individualRelation = relation.get();
        individualRelation.setName(individualRelationContract.getName());
        individualRelationService.saveGenderMappings(individualRelationContract, individualRelation);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping(value = "/web/relation/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @ResponseBody
    @Transactional
    public void deleteIndividualRelation(@PathVariable Long id) {
        Optional<IndividualRelation> relation = individualRelationRepository.findById(id);
        if (relation.isPresent()) {
            IndividualRelation individualRelation = relation.get();
            individualRelation.setVoided(true);
            individualRelationRepository.save(individualRelation);
        }
    }
}
