package org.openchs.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;
import org.openchs.application.KeyType;
import org.openchs.application.OrganisationConfigSettingKeys;
import org.openchs.dao.ConceptRepository;
import org.openchs.dao.OrganisationConfigRepository;
import org.openchs.domain.JsonObject;
import org.openchs.domain.Organisation;
import org.openchs.domain.OrganisationConfig;
import org.openchs.domain.SubjectType;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.projection.ConceptProjection;
import org.openchs.util.ObjectMapperSingleton;
import org.openchs.web.request.OrganisationConfigRequest;
import org.openchs.web.request.webapp.SubjectTypeSetting;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.*;
import java.util.function.Predicate;
import java.util.stream.Collectors;

@Service
public class OrganisationConfigService {

    private final OrganisationConfigRepository organisationConfigRepository;
    private final ProjectionFactory projectionFactory;
    private final ConceptRepository conceptRepository;
    private final LocationHierarchyService locationHierarchyService;
    private ObjectMapper objectMapper;
    private final Logger logger;


    @Autowired
    public OrganisationConfigService(OrganisationConfigRepository organisationConfigRepository,
                                     ProjectionFactory projectionFactory,
                                     ConceptRepository conceptRepository,
                                     @Lazy LocationHierarchyService locationHierarchyService) {
        this.organisationConfigRepository = organisationConfigRepository;
        this.projectionFactory = projectionFactory;
        this.conceptRepository = conceptRepository;
        this.locationHierarchyService = locationHierarchyService;
        objectMapper = ObjectMapperSingleton.getObjectMapper();
        logger = LoggerFactory.getLogger(this.getClass());
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

    public LinkedHashMap<String, Object> getOrganisationSettings(Long organisationId) {
        JsonObject jsonObject = organisationConfigRepository.findByOrganisationId(organisationId).getSettings();
        LinkedHashMap<String, Object> organisationSettingsConceptListMap = new LinkedHashMap<>();
        List<String> conceptUuidList = new ArrayList<>();
        try {
            JSONObject jsonObj = new JSONObject(jsonObject.toString());
            JSONArray jsonArray = jsonObj.getJSONArray("searchFilters");
            for (int i = 0; i < jsonArray.length(); i++) {
                if (jsonArray.getJSONObject(i).has("conceptUUID")) {
                    String uuid = jsonArray.getJSONObject(i).getString("conceptUUID");
                    if (null != uuid && !"".equals(uuid.trim()))
                        conceptUuidList.add(uuid.trim());
                }
            }
        } catch (JSONException e) {
            logger.error("Ignoring JSONException " + e.getMessage() + " and setting empty searchFilters array in response.");
            jsonObject.put("searchFilters", Collections.emptyList());
        }
        List<ConceptProjection> conceptList = conceptRepository.getAllConceptByUuidIn(conceptUuidList).stream()
                .map(concept -> projectionFactory.createProjection(ConceptProjection.class, concept))
                .collect(Collectors.toList());
        organisationSettingsConceptListMap.put("organisationConfig", jsonObject);
        organisationSettingsConceptListMap.put("conceptList", conceptList);
        return organisationSettingsConceptListMap;
    }

    public JsonObject getOrganisationSettingsJson(Long organisationId) {
        return organisationConfigRepository.findByOrganisationId(organisationId).getSettings();
    }

    @Transactional
    public OrganisationConfig updateLowestAddressLevelTypeSetting(HashSet<String> locationConceptUuids) {
        try {
            JsonObject organisationSettings = getOrganisationSettingsJson(UserContextHolder.getUserContext().getOrganisationId());

            JsonObject settings = new JsonObject();
            settings.put(String.valueOf(OrganisationConfigSettingKeys.lowestAddressLevelType), locationHierarchyService.determineAddressHierarchiesToBeSaved(organisationSettings, locationConceptUuids));
            return updateOrganisationSettings(settings);
        } catch (Exception exception) {
            exception.printStackTrace();
        }
        return null;
    }

    @Transactional
    public void updateSettings(String key, Object otpLength) {
        OrganisationConfig organisationConfig = organisationConfigRepository.findAll()
                .stream().findFirst()
                .orElse(new OrganisationConfig());
        JsonObject jsonObject = organisationConfig.getSettings();
        jsonObject.with(key, otpLength);
        organisationConfig.updateLastModifiedDateTime();
        organisationConfigRepository.save(organisationConfig);
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
        organisationConfig.updateAudit();
        return organisationConfigRepository.save(organisationConfig);
    }

    public Object getSettingsByKey(String key) {
        Long organisationId = UserContextHolder.getUserContext().getOrganisationId();
        OrganisationConfig organisationConfig = organisationConfigRepository.findByOrganisationId(organisationId);
        return organisationConfig.getSettings().getOrDefault(key, Collections.EMPTY_LIST);
    }

    public void saveCustomRegistrationLocations(List<String> locationTypeUUIDs, SubjectType subjectType) {
        Long organisationId = UserContextHolder.getUserContext().getOrganisationId();
        OrganisationConfig organisationConfig = organisationConfigRepository.findByOrganisationId(organisationId);
        JsonObject organisationConfigSettings = organisationConfig.getSettings();
        String settingsKeyName = KeyType.customRegistrationLocations.toString();
        List<SubjectTypeSetting> updatedCustomRegistrationLocations = getUpdatedCustomRegistrationLocations(locationTypeUUIDs, subjectType, organisationConfigSettings, settingsKeyName);
        organisationConfigSettings.put(settingsKeyName, updatedCustomRegistrationLocations);
        organisationConfigRepository.save(organisationConfig);
    }

    private List<SubjectTypeSetting> getUpdatedCustomRegistrationLocations(List<String> locationTypeUUIDs, SubjectType subjectType, JsonObject organisationConfigSettings, String settingsKeyName) {
        List<SubjectTypeSetting> savedSettings = objectMapper.convertValue(organisationConfigSettings.getOrDefault(settingsKeyName, Collections.EMPTY_LIST), new TypeReference<List<SubjectTypeSetting>>() {});
        List<SubjectTypeSetting> otherSubjectTypeSettings = filterSubjectTypeSettingsBasedOn(savedSettings, setting -> !setting.getSubjectTypeUUID().equals(subjectType.getUuid()));
        SubjectTypeSetting subjectTypeSetting = new SubjectTypeSetting();
        subjectTypeSetting.setSubjectTypeUUID(subjectType.getUuid());
        subjectTypeSetting.setLocationTypeUUIDs(locationTypeUUIDs);
        otherSubjectTypeSettings.add(subjectTypeSetting);
        return filterSubjectTypeSettingsBasedOn(otherSubjectTypeSettings, setting -> setting.getLocationTypeUUIDs() != null);
    }

    private List<SubjectTypeSetting> filterSubjectTypeSettingsBasedOn(List<SubjectTypeSetting> subjectTypeSettings, Predicate<SubjectTypeSetting> predicate) {
        return subjectTypeSettings
                .stream()
                .filter(predicate)
                .collect(Collectors.toList());
    }

}
