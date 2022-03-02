import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { AvniSwitch } from "../../common/components/AvniSwitch";
import React from "react";
import http from "common/utils/httpClient";
import { getOperationalModules, selectOperationalModules } from "../../reports/reducers";
import { useDispatch, useSelector } from "react-redux";
import { isNil, map, set, sortBy } from "lodash";
import { FormMappingEnableApproval } from "./FormMappingEnableApproval";

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

  const organisationConfigSettingKeys = {
    approvalWorkflow: "enableApprovalWorkflow",
    draftSave: "saveDrafts",
    hideDateOfBirth: "hideDateOfBirth",
    enableComments: "enableComments",
    showSummaryButton: "showSummaryButton",
    enableRuleDesigner: "enableRuleDesigner"
  };

  return orgSettings ? (
    <Grid item container direction={"column"}>
      <Grid item>
        <Typography variant="h5" gutterBottom>
          Organisation settings
        </Typography>
      </Grid>
      <Grid item container spacing={1} direction={"column"}>
        <Grid item>
          <AvniSwitch
            switchFirst
            checked={orgSettings[organisationConfigSettingKeys.approvalWorkflow]}
            onChange={event =>
              onSettingsChange(organisationConfigSettingKeys.approvalWorkflow, event.target.checked)
            }
            name="Approval workflow"
            toolTipKey={"ADMIN_APPROVAL_WORKFLOW"}
          />
        </Grid>
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
        <Grid item>
          <AvniSwitch
            switchFirst
            checked={orgSettings[organisationConfigSettingKeys.draftSave]}
            onChange={event =>
              onSettingsChange(organisationConfigSettingKeys.draftSave, event.target.checked)
            }
            name="Draft save"
            toolTipKey={"ADMIN_SAVE_DRAFT"}
          />
        </Grid>
        <Grid item>
          <AvniSwitch
            switchFirst
            checked={orgSettings[organisationConfigSettingKeys.hideDateOfBirth]}
            onChange={event =>
              onSettingsChange(organisationConfigSettingKeys.hideDateOfBirth, event.target.checked)
            }
            name="Hide Date of Birth on DEA"
            toolTipKey={"ADMIN_HIDE_DOB"}
          />
        </Grid>
        <Grid item>
          <AvniSwitch
            switchFirst
            checked={orgSettings[organisationConfigSettingKeys.enableComments]}
            onChange={event =>
              onSettingsChange(organisationConfigSettingKeys.enableComments, event.target.checked)
            }
            name="Enable comments"
            toolTipKey={"ADMIN_ENABLE_COMMENTS"}
          />
        </Grid>
        <Grid item>
          <AvniSwitch
            switchFirst
            checked={orgSettings[organisationConfigSettingKeys.showSummaryButton]}
            onChange={event =>
              onSettingsChange(
                organisationConfigSettingKeys.showSummaryButton,
                event.target.checked
              )
            }
            name="Show summary button"
            toolTipKey={"ADMIN_SHOW_SUMMARY_BUTTON"}
          />
        </Grid>
        <Grid item>
          <AvniSwitch
            switchFirst
            checked={orgSettings[organisationConfigSettingKeys.enableRuleDesigner]}
            onChange={event =>
              onSettingsChange(
                organisationConfigSettingKeys.enableRuleDesigner,
                event.target.checked
              )
            }
            name="Enable rule designer"
            toolTipKey={"ADMIN_ENABLE_RULE_DESIGNER"}
          />
        </Grid>
      </Grid>
    </Grid>
  ) : (
    <div />
  );
};
