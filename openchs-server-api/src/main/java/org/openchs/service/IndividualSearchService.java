package org.openchs.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.joda.time.LocalDate;
import org.openchs.dao.IndividualRepository;
import org.openchs.domain.Organisation;
import org.openchs.domain.UserContext;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.util.ObjectMapperSingleton;
import org.openchs.web.request.EnrolmentContract;
import org.openchs.web.request.IndividualContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Query;
import javax.transaction.Transactional;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class IndividualSearchService {
    private final EntityManager entityManager;

    @Autowired
    public IndividualSearchService(IndividualRepository individualRepository, EntityManagerFactory entityManagerFactory)
    {
        this.entityManager = entityManagerFactory.createEntityManager();
    }

    @Transactional
    public LinkedHashMap<String, Object> getSearchResult(String jsonSearch) {
        UserContext userContext = UserContextHolder.getUserContext();
        Organisation organisation = userContext.getOrganisation();
        String dbUser = organisation.getDbUser();
        Query q = entityManager.createNativeQuery("select firstname,lastname,fullname,id,uuid,title_lineage,subject_type_name" +
                ",gender_name,date_of_birth,enrolments,total_elements " +
                "from web_search_function (?1,?2)");
        q.setParameter(1, jsonSearch);
        q.setParameter(2,dbUser);
        List<Object[]> listOfObject = q.getResultList();
        return constructIndividual(listOfObject);
    }


    private LinkedHashMap<String, Object> constructIndividual(List<Object[]> individualList) {
        BigInteger totalElements= new BigInteger("0");
        LinkedHashMap<String, Object> recordsMap=new LinkedHashMap<String, Object>();
        List<IndividualContract> individualRecordList= individualList.stream()
                .map(individualRecord -> {
                    IndividualContract individualContract = new IndividualContract();
                    individualContract.setFirstName((String) individualRecord[0]);
                    individualContract.setLastName((String) individualRecord[1]);
                    individualContract.setFullName((String) individualRecord[2]);
                    if(null!=individualRecord[3] && !"".equals(individualRecord[3].toString().trim()))
                    individualContract.setId(new Long(individualRecord[3].toString()));
                    individualContract.setUuid((String) individualRecord[4]);
                    individualContract.setAddressLevel((String) individualRecord[5]);
                    individualContract.setSubjectTypeName((String) individualRecord[6]);
                    individualContract.setGender((String) individualRecord[7]);
                    if(null!=individualRecord[8] && !"".equals(individualRecord[8].toString().trim()))
                    individualContract.setDateOfBirth(new LocalDate(individualRecord[8].toString()));
                    individualContract.setEnrolments(constructEnrolments((String) individualRecord[9]));

                    return individualContract;
                }).collect(Collectors.toList());
                 if(null!=individualList && individualList.size()>0){
                        Object[] firstRecord=individualList.get(0);
                        if(null!=firstRecord[10] && !"".equals(firstRecord[10].toString().trim()))
                        totalElements=new BigInteger(firstRecord[10].toString());
        }
        recordsMap.put("totalElements",totalElements);
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