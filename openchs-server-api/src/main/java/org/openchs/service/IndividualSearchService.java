package org.openchs.service;

import org.joda.time.LocalDate;
import org.openchs.application.projections.WebSearchResultProjection;
import org.openchs.dao.IndividualRepository;
import org.openchs.domain.Organisation;
import org.openchs.domain.UserContext;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.web.request.EnrolmentContract;
import org.openchs.web.request.IndividualContract;
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
    private final IndividualRepository individualRepository;

    @Autowired
    public IndividualSearchService(IndividualRepository individualRepository) {
        this.individualRepository = individualRepository;
    }

    @Transactional
    public LinkedHashMap<String, Object> getSearchResult(String jsonSearch) {
        UserContext userContext = UserContextHolder.getUserContext();
        Organisation organisation = userContext.getOrganisation();
        String dbUser = organisation.getDbUser();
        List<WebSearchResultProjection> webSearchResults = individualRepository.getWebSearchResults(jsonSearch, dbUser);
        return constructIndividual(webSearchResults);
    }


    private LinkedHashMap<String, Object> constructIndividual(List<WebSearchResultProjection> individualList) {
        BigInteger totalElements = new BigInteger("0");
        LinkedHashMap<String, Object> recordsMap = new LinkedHashMap<String, Object>();
        List<IndividualContract> individualRecordList = individualList.stream()
                .map(individualRecord -> {
                    IndividualContract individualContract = new IndividualContract();
                    individualContract.setFirstName(individualRecord.getFirstname());
                    individualContract.setLastName(individualRecord.getLastname());
                    individualContract.setFullName(individualRecord.getFullname());
                    String id = individualRecord.getId();
                    if (null != id && !"".equals(id.trim()))
                        individualContract.setId(new Long(id));
                    individualContract.setUuid(individualRecord.getUuid());
                    individualContract.setAddressLevel(individualRecord.getTitle_lineage());
                    individualContract.setSubjectTypeName(individualRecord.getSubject_type_name());
                    individualContract.setGender(individualRecord.getGender_name());
                    String date_of_birth = individualRecord.getDate_of_birth();
                    if (null != date_of_birth && !"".equals(date_of_birth.trim()))
                        individualContract.setDateOfBirth(new LocalDate(date_of_birth));
                    individualContract.setEnrolments(constructEnrolments(individualRecord.getEnrolments()));

                    return individualContract;
                }).collect(Collectors.toList());
        if (null != individualList && individualList.size() > 0) {
            WebSearchResultProjection firstRecord = individualList.get(0);
            String total_elements = firstRecord.getTotal_elements();
            if (null != total_elements && !"".equals(total_elements.trim()))
                totalElements = new BigInteger(total_elements);
        }
        recordsMap.put("totalElements", totalElements);
        recordsMap.put("listOfRecords", individualRecordList);
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