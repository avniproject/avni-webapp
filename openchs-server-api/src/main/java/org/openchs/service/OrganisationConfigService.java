package org.openchs.service;

import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;
import org.openchs.dao.ConceptRepository;
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
    private final ConceptRepository conceptRepository;

    @Autowired
    public OrganisationConfigService(OrganisationConfigRepository organisationConfigRepository, ProjectionFactory projectionFactory,ConceptRepository conceptRepository) {
        this.organisationConfigRepository = organisationConfigRepository;
        this.projectionFactory = projectionFactory;
        this.conceptRepository=conceptRepository;
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
    public LinkedHashMap<String,Object> getOrganisationSettings(Long organisationId) throws JSONException {
        JsonObject jsonObject = organisationConfigRepository.findByOrganisationId(organisationId).getSettings();
        LinkedHashMap<String,Object> organisationSettingsConceptListMap = new LinkedHashMap<>();
        List<String> conceptUuidList = new ArrayList<>();
        JSONObject jsonObj=new JSONObject(jsonObject.toString());
        JSONArray jsonArray=  jsonObj.getJSONArray("searchFilters");
        String uuid=null;
        for(int i=0;i<jsonArray.length();i++) {
            if(jsonArray.getJSONObject(i).has("conceptUUID")) {
                uuid = jsonArray.getJSONObject(i).getString("conceptUUID");
                if (null != uuid && !"".equals(uuid.trim()))
                    conceptUuidList.add(uuid.trim());
            }
        }
        List<ConceptProjection> conceptList= conceptRepository.getAllConceptByUuidIn(conceptUuidList).stream()
                    .map(concept -> projectionFactory.createProjection(ConceptProjection.class, concept))
                    .collect(Collectors.toList());
        organisationSettingsConceptListMap.put("organisationConfig", jsonObject);
        organisationSettingsConceptListMap.put("conceptList", conceptList);
        return organisationSettingsConceptListMap;
    }
}
