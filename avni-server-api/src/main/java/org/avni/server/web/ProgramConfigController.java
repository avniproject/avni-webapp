package org.avni.server.web;

import org.avni.server.dao.ConceptRepository;
import org.avni.server.dao.ProgramOrganisationConfigRepository;
import org.avni.server.dao.ProgramRepository;
import org.avni.server.domain.Concept;
import org.avni.server.domain.Program;
import org.avni.server.domain.ProgramOrganisationConfig;
import org.avni.server.domain.programConfig.VisitScheduleConfig;
import org.avni.server.util.O;
import org.avni.server.web.request.ProgramConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;

@RestController
public class ProgramConfigController {
    @Autowired
    private ProgramOrganisationConfigRepository programOrganisationConfigRepository;

    @Autowired
    private ProgramRepository programRepository;

    @Autowired
    private ConceptRepository conceptRepository;


    @RequestMapping(value = "/{programName}/config", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    @Transactional
    public void save(@PathVariable("programName") String programName, @RequestBody ProgramConfig programConfig) {
        VisitScheduleConfig visitScheduleConfig = new VisitScheduleConfig(programConfig.getVisitSchedule());
        Program program = programRepository.findByName(StringUtils.capitalize(programName.toLowerCase()));
        ProgramOrganisationConfig existingProgramOrganisationConfig = programOrganisationConfigRepository.findByProgram(program);
        ProgramOrganisationConfig programOrganisationConfig = (ProgramOrganisationConfig)
                O.coalesce(existingProgramOrganisationConfig, new ProgramOrganisationConfig());
        programOrganisationConfig.setProgram(program);
        programOrganisationConfig.setVisitSchedule(visitScheduleConfig);
        programOrganisationConfig.assignUUIDIfRequired();
        programConfig.getAtRiskConcepts().forEach(conceptContract -> {
            Concept concept = conceptRepository.findByUuid(conceptContract.getUuid());
            programOrganisationConfig.addAtRiskConcept(concept);
        });
        programOrganisationConfigRepository.save(programOrganisationConfig);
    }

}
