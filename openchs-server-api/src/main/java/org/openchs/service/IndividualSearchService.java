package org.openchs.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.joda.time.LocalDate;
import org.openchs.dao.IndividualRepository;
import org.openchs.domain.SubjectType;
import org.openchs.util.ObjectMapperSingleton;
import org.openchs.web.request.EnrolmentContract;
import org.openchs.web.request.IndividualContract;
import org.openchs.web.request.SubjectTypeContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Query;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class IndividualSearchService {
    private final IndividualRepository individualRepository;
    private final EntityManager entityManager;
    private ObjectMapper objectMapper;

    @Autowired
    public IndividualSearchService(IndividualRepository individualRepository, EntityManagerFactory entityManagerFactory)
    {
        this.individualRepository = individualRepository;
        this.entityManager = entityManagerFactory.createEntityManager();
        objectMapper = ObjectMapperSingleton.getObjectMapper();
    }

    public List<IndividualContract> getsearchResult(String jsonSearch) {
        Query q = entityManager.createNativeQuery("select firstname,lastname,fullname,id,uuid,title_lineage,subject_type_name" +
                ",gender_name,date_of_birth,enrolments,total_elements " +
                "from web_search_function (?1)");
        q.setParameter(1, jsonSearch);
        List<Object[]> obj = q.getResultList();
        return constructIndividual(obj);
    }



    private SubjectTypeContract constructSubjectType(SubjectType subjectType) {
        SubjectTypeContract subjectTypeContract = new SubjectTypeContract();
        //subjectTypeContract.setUuid(subjectType.getUuid());
        subjectTypeContract.setName(subjectType.getName());
        //subjectTypeContract.setVoided(subjectType.isVoided());
        return subjectTypeContract;
    }


    private List<IndividualContract> constructIndividual(List<Object[]> individualList) {
        return individualList.stream()
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
                    if(null!=individualRecord[10] && !"".equals(individualRecord[10].toString().trim()))
                    individualContract.setTotalElements(new BigInteger(individualRecord[10].toString()));


                    return individualContract;
                }).collect(Collectors.toList());
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