package org.avni.server.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;
import org.avni.server.application.FormMapping;
import org.avni.server.application.KeyType;
import org.avni.server.application.OrganisationConfigSettingKey;
import org.avni.server.dao.ConceptRepository;
import org.avni.server.dao.OrganisationConfigRepository;
import org.avni.server.dao.application.FormMappingRepository;
import org.avni.server.domain.JsonObject;
import org.avni.server.domain.Organisation;
import org.avni.server.domain.OrganisationConfig;
import org.avni.server.domain.SubjectType;
import org.avni.server.framework.security.UserContextHolder;
import org.avni.server.projection.ConceptProjection;
import org.avni.server.util.ObjectMapperSingleton;
import org.avni.server.web.request.OrganisationConfigRequest;
import org.avni.server.web.request.webapp.SubjectTypeSetting;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import org.joda.time.DateTime;
import java.util.*;
import java.util.function.Predicate;
import java.util.stream.Collectors;

@Service
public class OrganisationConfigService implements NonScopeAwareService {

    private final OrganisationConfigRepository organisationConfigRepository;
    private final ProjectionFactory projectionFactory;
    private final ConceptRepository conceptRepository;
    private final LocationHierarchyService locationHierarchyService;
    private final FormMappingRepository formMappingRepository;
    private final ObjectMapper objectMapper;
    private final Logger logger;


    @Autowired
    public OrganisationConfigService(OrganisationConfigRepository organisationConfigRepository,
                                     ProjectionFactory projectionFactory,
                                     ConceptRepository conceptRepository,
                                     FormMappingRepository formMappingRepository,
                                     @Lazy LocationHierarchyService locationHierarchyService) {
        this.organisationConfigRepository = organisationConfigRepository;
        this.projectionFactory = projectionFactory;
        this.conceptRepository = conceptRepository;
        this.locationHierarchyService = locationHierarchyService;
        this.formMappingRepository = formMappingRepository;
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
        OrganisationConfig organisationConfig = organisationConfigRepository.findByOrganisationId(organisationId);
        JsonObject settings = new JsonObject(organisationConfig.getSettings());
        LinkedHashMap<String, Object> organisationSettingsConceptListMap = new LinkedHashMap<>();
        List<String> conceptUuidList = new ArrayList<>();
        JsonObject searchFilters = new JsonObject().with("searchFilters", settings.getOrDefault("searchFilters", Collections.emptyList()));
        try {
            JSONObject jsonObj = new JSONObject(searchFilters.toString());
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
            settings.put("searchFilters", Collections.emptyList());
        }
        List<ConceptProjection> conceptList = conceptRepository.getAllConceptByUuidIn(conceptUuidList).stream()
                .map(concept -> projectionFactory.createProjection(ConceptProjection.class, concept))
                .collect(Collectors.toList());
        organisationSettingsConceptListMap.put("organisationConfig", settings);
        organisationSettingsConceptListMap.put("conceptList", conceptList);
        return organisationSettingsConceptListMap;
    }

    public JsonObject getOrganisationSettingsJson(Long organisationId) {
        return organisationConfigRepository.findByOrganisationId(organisationId).getSettings();
    }

    public Optional<Object> getOrganisationSettingsValue(Organisation organisation, OrganisationConfigSettingKey settingKey) {
        JsonObject jsonObject = this.getOrganisationSettingsJson(organisation.getId());
        return Optional.ofNullable(jsonObject.get(settingKey.name()));
    }

    @Transactional
    public OrganisationConfig updateLowestAddressLevelTypeSetting(HashSet<String> locationConceptUuids) {
        try {
            JsonObject organisationSettings = getOrganisationSettingsJson(UserContextHolder.getUserContext().getOrganisationId());

            JsonObject settings = new JsonObject();
            settings.put(String.valueOf(OrganisationConfigSettingKey.lowestAddressLevelType), locationHierarchyService.determineAddressHierarchiesToBeSaved(organisationSettings, locationConceptUuids));
            return updateOrganisationSettings(settings);
        } catch (Exception exception) {
            exception.printStackTrace();
        }
        return null;
    }

    @Transactional
    public void updateSettings(String key, Object settingObject) {
        OrganisationConfig organisationConfig = organisationConfigRepository.findAll()
                .stream().findFirst()
                .orElse(new OrganisationConfig());
        JsonObject jsonObject = organisationConfig.getSettings();
        jsonObject.with(key, settingObject);
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
        newSettings.keySet().forEach(key -> {
            currentSettings.put(key, newSettings.get(key));
            if (key.equals(OrganisationConfigSettingKey.enableApprovalWorkflow.toString())) {
                boolean enableApprovalWorkflow = (boolean) newSettings.get(key);
                updateEnableApprovalForAllForms(enableApprovalWorkflow);
            }
        });
        return currentSettings;
    }

    private void updateEnableApprovalForAllForms(boolean enableApprovalWorkflow) {
        List<FormMapping> updatedFormMappings = formMappingRepository.findAll()
                .stream()
                .peek(m -> {
                    m.setEnableApproval(enableApprovalWorkflow);
                    m.updateAudit();
                })
                .collect(Collectors.toList());
        formMappingRepository.saveAll(updatedFormMappings);
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

    private Boolean isFeatureEnabled(String feature) {
        Long organisationId = UserContextHolder.getUserContext().getOrganisationId();
        OrganisationConfig organisationConfig = organisationConfigRepository.findByOrganisationId(organisationId);
        if (organisationConfig == null) {
            return false;
        }
        return (Boolean) organisationConfig.getSettings().getOrDefault(feature, false);
    }

    public Boolean isApprovalWorkflowEnabled() {
        return isFeatureEnabled("enableApprovalWorkflow");
    }

    public boolean isCommentEnabled() {
        return isFeatureEnabled("enableComments");
    }

    public boolean isMessagingEnabled() {
        return isFeatureEnabled(OrganisationConfigSettingKey.enableMessaging.name());
    }

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        return organisationConfigRepository.existsByLastModifiedDateTimeGreaterThan(lastModifiedDateTime);
    }

}
