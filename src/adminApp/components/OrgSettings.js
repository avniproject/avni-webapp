import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { AvniSwitch } from "../../common/components/AvniSwitch";
import React from "react";
import http from "common/utils/httpClient";
import { getOperationalModules, selectOperationalModules } from "../../reports/reducers";
import { useDispatch, useSelector } from "react-redux";
import { isNil, map, set, sortBy, toNumber } from "lodash";
import { FormMappingEnableApproval } from "./FormMappingEnableApproval";
import { AvniTextField } from "../../common/components/AvniTextField";

export const OrgSettings = () => {
  const [orgSettings, setOrgSettings] = React.useState();
  const [formMappingState, setFormMappingState] = React.useState();
  const dispatch = useDispatch();
  const { formMappings, encounterTypes, programs, subjectTypes } = useSelector(
    selectOperationalModules
  );
  const createFormMappingState = enableApproval =>
    sortBy(
      map(formMappings, fm =>
        set(fm, "enableApproval", isNil(enableApproval) ? fm.enableApproval : enableApproval)
      ),
      "subjectTypeUUID",
      "programUUID",
      "encounterTypeUUID"
    );

  React.useEffect(() => {
    setFormMappingState(createFormMappingState());
  }, [formMappings]);

  React.useEffect(() => {
    dispatch(getOperationalModules());
    http
      .fetchJson("/web/organisationConfig")
      .then(response => response.json)
      .then(({ organisationConfig }) => setOrgSettings(organisationConfig));
  }, []);

  const onSettingsChange = (settingsName, value) => {
    const payload = { settings: { [settingsName]: value } };
    http
      .put("/organisationConfig", payload)
      .then(response => {
        if (response.status === 200 || response.status === 201) {
          setOrgSettings(response.data.settings);
          setFormMappingState(createFormMappingState(value));
        }
        return response;
      })
      .catch(error => console.error(error));
  };

  function renderSimpleSetting(key, name, tooltip) {
    return (
      <Grid item>
        <AvniSwitch
          switchFirst
          checked={orgSettings[key]}
          onChange={event => onSettingsChange(key, event.target.checked)}
          name={name}
          toolTipKey={tooltip}
        />
      </Grid>
    );
  }

  const organisationConfigSettingKeys = {
    approvalWorkflow: "enableApprovalWorkflow",
    draftSave: "saveDrafts",
    hideDateOfBirth: "hideDateOfBirth",
    enableComments: "enableComments",
    showSummaryButton: "showSummaryButton",
    useKeycloakAsIDP: "useKeycloakAsIDP",
    useMinioForStorage: "useMinioForStorage",
    skipRuleExecution: "skipRuleExecution",
    maxAddressDisplayInlineCount: "maxAddressDisplayInlineCount",
    showHierarchicalLocation: "showHierarchicalLocation"
  };

  return orgSettings ? (
    <Grid item container direction={"column"}>
      <Grid item>
        <Typography variant="h5" gutterBottom>
          Organisation settings
        </Typography>
      </Grid>
      <Grid item container spacing={1} direction={"column"}>
        {renderSimpleSetting(
          organisationConfigSettingKeys.approvalWorkflow,
          "Approval workflow",
          "ADMIN_APPROVAL_WORKFLOW"
        )}
        {orgSettings[organisationConfigSettingKeys.approvalWorkflow] && (
          <Grid item>
            <Typography variant="body2" gutterBottom>
              Create custom dashboard with standard card types approve, reject and pending to track
              the approval workflow.
            </Typography>
            <FormMappingEnableApproval
              disableCheckbox={!orgSettings[organisationConfigSettingKeys.approvalWorkflow]}
              encounterTypes={encounterTypes}
              formMappingState={formMappingState}
              programs={programs}
              setFormMappingState={setFormMappingState}
              subjectTypes={subjectTypes}
            />
          </Grid>
        )}
        {renderSimpleSetting(
          organisationConfigSettingKeys.draftSave,
          "Draft save",
          "ADMIN_SAVE_DRAFT"
        )}
        {renderSimpleSetting(
          organisationConfigSettingKeys.hideDateOfBirth,
          "Hide Date of Birth on DEA",
          "ADMIN_HIDE_DOB"
        )}
        {renderSimpleSetting(
          organisationConfigSettingKeys.enableComments,
          "Enable comments",
          "ADMIN_ENABLE_COMMENTS"
        )}
        {renderSimpleSetting(
          organisationConfigSettingKeys.showSummaryButton,
          "Show summary button",
          "ADMIN_SHOW_SUMMARY_BUTTON"
        )}
        {renderSimpleSetting(
          organisationConfigSettingKeys.useKeycloakAsIDP,
          "Use Keycloak as IDP",
          "USE_KEYCLOAK_AS_IDP"
        )}
        {renderSimpleSetting(
          organisationConfigSettingKeys.useMinioForStorage,
          "Use MinIO for Storage",
          "USE_MINIO_FOR_STORAGE"
        )}
        {renderSimpleSetting(
          organisationConfigSettingKeys.skipRuleExecution,
          "Skip rule executions on upload",
          "SKIP_RULE_EXECUTION_ON_UPLOAD"
        )}
        {renderSimpleSetting(
          organisationConfigSettingKeys.showHierarchicalLocation,
          "Show hierarchical location",
          "SHOW_HIERARCHICAL_LOCATION"
        )}
        <AvniTextField
          style={{ marginLeft: 8, marginTop: 10 }}
          id="maxAddressDisplayInlineCount"
          type="number"
          variant="outlined"
          label="Inline address count"
          autoComplete="off"
          value={orgSettings.maxAddressDisplayInlineCount}
          onChange={event =>
            onSettingsChange(
              organisationConfigSettingKeys.maxAddressDisplayInlineCount,
              toNumber(event.target.value)
            )
          }
          toolTipKey={"MAX_ADDRESS_DISPLAY_INLINE_COUNT"}
        />
      </Grid>
    </Grid>
  ) : (
    <div />
  );
};
