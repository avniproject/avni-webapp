package org.openchs.service;

import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;
import org.openchs.application.OrganisationConfigSettingKeys;
import org.openchs.dao.ConceptRepository;
import org.openchs.dao.OrganisationConfigRepository;
import org.openchs.domain.JsonObject;
import org.openchs.domain.Organisation;
import org.openchs.domain.OrganisationConfig;
import org.openchs.framework.security.UserContextHolder;
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
    public OrganisationConfigService(OrganisationConfigRepository organisationConfigRepository, ProjectionFactory projectionFactory, ConceptRepository conceptRepository) {
        this.organisationConfigRepository = organisationConfigRepository;
        this.projectionFactory = projectionFactory;
        this.conceptRepository = conceptRepository;
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

    public OrganisationConfig getOrganisationConfig(Organisation organisation) {
        return organisationConfigRepository.findByOrganisationId(organisation.getId());
    }

    public LinkedHashMap<String, Object> getOrganisationSettings(Long organisationId) throws JSONException {
        JsonObject jsonObject = organisationConfigRepository.findByOrganisationId(organisationId).getSettings();
        LinkedHashMap<String, Object> organisationSettingsConceptListMap = new LinkedHashMap<>();
        List<String> conceptUuidList = new ArrayList<>();
        JSONObject jsonObj = new JSONObject(jsonObject.toString());
        JSONArray jsonArray = jsonObj.getJSONArray("searchFilters");
        String uuid = null;
        for (int i = 0; i < jsonArray.length(); i++) {
            if (jsonArray.getJSONObject(i).has("conceptUUID")) {
                uuid = jsonArray.getJSONObject(i).getString("conceptUUID");
                if (null != uuid && !"".equals(uuid.trim()))
                    conceptUuidList.add(uuid.trim());
            }
        }
        List<ConceptProjection> conceptList = conceptRepository.getAllConceptByUuidIn(conceptUuidList).stream()
                .map(concept -> projectionFactory.createProjection(ConceptProjection.class, concept))
                .collect(Collectors.toList());
        organisationSettingsConceptListMap.put("organisationConfig", jsonObject);
        organisationSettingsConceptListMap.put("conceptList", conceptList);
        return organisationSettingsConceptListMap;
    }

    public OrganisationConfig updateLowestAddressLevelTypeSettingIfRequired(Double lowestAddressLevelType) {
        try {
            LinkedHashMap<String, Object> organisationSettings = getOrganisationSettings(UserContextHolder.getUserContext().getOrganisationId());
            Double currentLowestAddressLevelType = Double.parseDouble(String.valueOf(organisationSettings.get(OrganisationConfigSettingKeys.lowestAddressLevelType)));
            if (lowestAddressLevelType < currentLowestAddressLevelType) {
                JsonObject settings = new JsonObject();
                settings.put(String.valueOf(OrganisationConfigSettingKeys.lowestAddressLevelType), lowestAddressLevelType);
                return updateOrganisationSettings(settings);
            }
        } catch (Exception exception) {
            exception.printStackTrace();
        }
        return null;
    }

    @Transactional
    public OrganisationConfig updateOrganisationSettings(JsonObject settings) {
        long organisationId = UserContextHolder.getUserContext().getOrganisationId();
        OrganisationConfig organisationConfig = organisationConfigRepository.findByOrganisationId(organisationId);
        if (organisationConfig == null) {
            organisationConfig = new OrganisationConfig();
        }
        organisationConfig.setOrganisationId(organisationId);
        organisationConfig.setUuid(UUID.randomUUID().toString());
        organisationConfig.updateLastModifiedDateTime();

        organisationConfig.setSettings(updateOrganisationConfigSettings(settings, organisationConfig.getSettings()));

        return organisationConfigRepository.save(organisationConfig);
    }

    public JsonObject updateOrganisationConfigSettings(JsonObject newSettings, JsonObject currentSettings) {
        newSettings.keySet().forEach(key -> currentSettings.put(key, newSettings.get(key)));
        return currentSettings;
    }

    @Transactional
    public OrganisationConfig updateOrganisationConfig(OrganisationConfigRequest request, OrganisationConfig organisationConfig) {

        if (request.getWorklistUpdationRule() != null)
            organisationConfig.setWorklistUpdationRule(request.getWorklistUpdationRule());
        if (request.getSettings() != null)
            organisationConfig.setSettings(updateOrganisationConfigSettings(request.getSettings(), organisationConfig.getSettings()));

        return organisationConfigRepository.save(organisationConfig);
    }
}
