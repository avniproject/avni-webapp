package org.avni.service;

import org.avni.dao.IndividualRepository;
import org.avni.dao.ProgramEnrolmentRepository;
import org.avni.dao.SubjectSearchRepository;
import org.avni.domain.Program;
import org.avni.web.request.EnrolmentContract;
import org.avni.web.request.webapp.search.SubjectSearchRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class IndividualSearchService {
    private final SubjectSearchRepository subjectSearchRepository;
    private ProgramEnrolmentRepository programEnrolmentRepository;

    @Autowired
    public IndividualSearchService(SubjectSearchRepository subjectSearchRepository, IndividualRepository individualRepository, ProgramEnrolmentRepository programEnrolmentRepository) {
        this.subjectSearchRepository = subjectSearchRepository;
        this.programEnrolmentRepository = programEnrolmentRepository;
    }

    @Transactional
    public LinkedHashMap<String, Object> search(SubjectSearchRequest subjectSearchRequest) {
        List<Map<String, Object>> searchResults = subjectSearchRepository.search(subjectSearchRequest);
        BigInteger totalCount = subjectSearchRepository.getTotalCount(subjectSearchRequest);
        return constructIndividual(searchResults, totalCount);
    }

    private LinkedHashMap<String, Object> constructIndividual(List<Map<String, Object>> individualList, BigInteger totalCount) {
        LinkedHashMap<String, Object> recordsMap = new LinkedHashMap<String, Object>();
        List<Map<String, Object>> listOfRecords = individualList.stream()
                .peek(individualRecord -> {
                    Long individualId = Long.valueOf((Integer) individualRecord.get("id"));
                    individualRecord.put("enrolments", constructEnrolments(individualId));
                }).collect(Collectors.toList());
        recordsMap.put("totalElements", totalCount);
        recordsMap.put("listOfRecords", listOfRecords);
        return recordsMap;
    }

    private List<EnrolmentContract> constructEnrolments(Long individualId) {
        List<EnrolmentContract> enrolmentContracts = new ArrayList<>();
        List<Program> programs = programEnrolmentRepository.findActiveEnrolmentsByIndividualId(individualId);

        programs.stream().forEach(program -> {
            EnrolmentContract enrolmentContract = new EnrolmentContract();
            enrolmentContract.setOperationalProgramName(program.getOperationalProgramName());
            enrolmentContract.setProgramColor(program.getColour());
            enrolmentContracts.add(enrolmentContract);
        });
        return enrolmentContracts;
    }
}
