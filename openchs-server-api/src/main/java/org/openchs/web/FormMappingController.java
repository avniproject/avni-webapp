package org.openchs.web;

import org.openchs.application.FormMapping;
import org.openchs.service.FormMappingService;
import org.openchs.web.request.FormMappingContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;
import java.util.List;

@RestController
public class FormMappingController extends AbstractController<FormMapping> {

    private final FormMappingService formMappingService;

    @Autowired
    public FormMappingController(FormMappingService formMappingService) {

        this.formMappingService = formMappingService;
    }

    @RequestMapping(value = "/formMappings", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    void save(@RequestBody List<FormMappingContract> formMappingRequests) {
        for (FormMappingContract formMappingRequest : formMappingRequests) {
            formMappingService.createOrUpdateFormMapping(formMappingRequest);
        }

    }
}