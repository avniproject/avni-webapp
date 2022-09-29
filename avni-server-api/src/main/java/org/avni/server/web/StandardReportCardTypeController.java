package org.avni.server.web;

import org.avni.server.dao.StandardReportCardTypeRepository;
import org.avni.server.domain.StandardReportCardType;
import org.avni.server.web.request.StandardReportCardTypeContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
public class StandardReportCardTypeController {

    private final StandardReportCardTypeRepository standardReportCardTypeRepository;

    @Autowired
    public StandardReportCardTypeController(StandardReportCardTypeRepository standardReportCardTypeRepository) {
        this.standardReportCardTypeRepository = standardReportCardTypeRepository;
    }

    @GetMapping(value = "/web/standardReportCardType")
    @PreAuthorize(value = "hasAnyAuthority('user','admin')")
    @ResponseBody
    public List<StandardReportCardTypeContract> getAll() {
        return standardReportCardTypeRepository.findAllByIsVoidedFalse()
                .stream().map(StandardReportCardTypeContract::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping(value = "/web/standardReportCardType/{id}")
    @PreAuthorize(value = "hasAnyAuthority('user','admin')")
    @ResponseBody
    public ResponseEntity<StandardReportCardTypeContract> getById(@PathVariable Long id) {
        Optional<StandardReportCardType> card = standardReportCardTypeRepository.findById(id);
        return card.map(c -> ResponseEntity.ok(StandardReportCardTypeContract.fromEntity(c)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

}
