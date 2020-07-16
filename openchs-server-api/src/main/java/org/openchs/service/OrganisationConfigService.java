package org.openchs.service;

import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;
import org.openchs.dao.OrganisationConfigRepository;
import org.openchs.domain.JsonObject;
import org.openchs.domain.Organisation;
import org.openchs.domain.OrganisationConfig;
import org.openchs.projection.ConceptProjection;
import org.openchs.web.request.OrganisationConfigRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrganisationConfigService {

    private final OrganisationConfigRepository organisationConfigRepository;
    private final ProjectionFactory projectionFactory;

    @Autowired
    public OrganisationConfigService(OrganisationConfigRepository organisationConfigRepository, ProjectionFactory projectionFactory) {

        this.organisationConfigRepository = organisationConfigRepository;
        this.projectionFactory = projectionFactory;
    }

    @Transactional
    public OrganisationConfig saveOrganisationConfig(OrganisationConfigRequest request, Organisation organisation) {
        OrganisationConfig organisationConfig = organisationConfigRepository.findByOrganisationId(organisation.getId());
        if (organisationConfig == null) {
            organisationConfig = new OrganisationConfig();
        }
        organisationConfig.setOrganisationId(organisation.getId());
        organisationConfig.setUuid(request.getUuid() == null ? UUID.randomUUID().toString() : request.getUuid());
        organisationConfig.setSettings(request.getSettings());
        organisationConfig.setWorklistUpdationRule(request.getWorklistUpdationRule());
        organisationConfig.updateLastModifiedDateTime();
        organisationConfigRepository.save(organisationConfig);
        return organisationConfig;
    }

    public Map<String,Object> getConcept(Long organisationId) throws JSONException {
        OrganisationConfigRepository repo = this.organisationConfigRepository;

        JsonObject jsonObject = repo.findByOrganisationId(organisationId).getSettings();

        List<String> conceptUuid = new ArrayList<>();
        JSONObject jsonObj=new JSONObject(jsonObject.toString());
        JSONArray jsonArray=  jsonObj.getJSONArray("searchFilters");

        for(int i=0;i<jsonArray.length();i++)
        {
            System.out.println("loop : "+jsonArray.getJSONObject(i).getString("conceptUUID"));
            conceptUuid.add(jsonArray.getJSONObject(i).getString("conceptUUID"));
        }

        Map<String,Object> map = new HashMap<>();
        map.put("organisationConfig", jsonObject);
        List<ConceptProjection> conceptList=
        organisationConfigRepository.getAllConceptByUuidIn(conceptUuid).stream()
                .map(concept -> projectionFactory.createProjection(ConceptProjection.class, concept))
                .collect(Collectors.toList());
        map.put("conceptList", conceptList);

        return map;
    }

}
