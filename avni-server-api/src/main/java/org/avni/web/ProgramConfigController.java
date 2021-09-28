package org.avni.web;

import org.avni.dao.ConceptRepository;
import org.avni.dao.ProgramOrganisationConfigRepository;
import org.avni.dao.ProgramRepository;
import org.avni.domain.Concept;
import org.avni.domain.Program;
import org.avni.domain.ProgramOrganisationConfig;
import org.avni.domain.programConfig.VisitScheduleConfig;
import org.avni.util.O;
import org.avni.web.request.ProgramConfig;
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
