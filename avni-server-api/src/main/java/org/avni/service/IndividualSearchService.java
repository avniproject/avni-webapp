package org.avni.service;

import org.joda.time.LocalDate;
import org.avni.dao.SubjectSearchRepository;
import org.avni.web.request.EnrolmentContract;
import org.avni.web.request.IndividualContract;
import org.avni.web.request.webapp.search.SubjectSearchRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class IndividualSearchService {
    private final SubjectSearchRepository subjectSearchRepository;

    @Autowired
    public IndividualSearchService( SubjectSearchRepository subjectSearchRepository) {
        this.subjectSearchRepository = subjectSearchRepository;
    }

    @Transactional
    public LinkedHashMap<String, Object> search(SubjectSearchRequest subjectSearchRequest) {
        List<Object[]> searchResults = subjectSearchRepository.search(subjectSearchRequest);
        BigInteger totalCount = subjectSearchRepository.getTotalCount(subjectSearchRequest);
        return constructIndividual(searchResults, totalCount);
    }

    private LinkedHashMap<String, Object> constructIndividual(List<Object[]> individualList, BigInteger totalCount) {
        LinkedHashMap<String, Object> recordsMap=new LinkedHashMap<String, Object>();
        List<IndividualContract> individualRecordList= individualList.stream()
                .map(individualRecord -> {
                    IndividualContract individualContract = new IndividualContract();
                    individualContract.setFirstName((String) individualRecord[1]);
                    individualContract.setLastName((String) individualRecord[2]);
                    individualContract.setFullName((String) individualRecord[3]);
                    if(null!=individualRecord[0] && !"".equals(individualRecord[0].toString().trim()))
                        individualContract.setId(new Long(individualRecord[0].toString()));
                    individualContract.setUuid((String) individualRecord[4]);
                    individualContract.setAddressLevel((String) individualRecord[5]);
                    individualContract.setSubjectTypeName((String) individualRecord[6]);
                    individualContract.setGender((String) individualRecord[7]);
                    if(null!=individualRecord[8] && !"".equals(individualRecord[8].toString().trim()))
                        individualContract.setDateOfBirth(new LocalDate(individualRecord[8].toString()));
                    individualContract.setEnrolments(constructEnrolments((String) individualRecord[9]));

                    return individualContract;
                }).collect(Collectors.toList());
        recordsMap.put("totalElements",totalCount);
        recordsMap.put("listOfRecords",individualRecordList);
        return recordsMap;
    }

    private List<EnrolmentContract> constructEnrolments(String enrolment) {
        List<EnrolmentContract> enrolmentContracts = new ArrayList<>();
        if (null != enrolment && !"".equals(enrolment.trim())) {
            String[] program = enrolment.split(",");
            for (String programs : program) {
                String[] programcolor = programs.split(":");
                if (null != programcolor && programcolor.length == 2) {
                    EnrolmentContract enrolmentContract = new EnrolmentContract();
                    enrolmentContract.setOperationalProgramName(programcolor[0]);
                    enrolmentContract.setProgramColor(programcolor[1]);
                    enrolmentContracts.add(enrolmentContract);
                }
            }
        }
        return enrolmentContracts;
    }
}
