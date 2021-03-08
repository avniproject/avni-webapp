import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { AvniSwitch } from "../../common/components/AvniSwitch";
import React from "react";
import http from "common/utils/httpClient";

export const OrgSettings = () => {
  const [orgSettings, setOrgSettings] = React.useState();

  React.useEffect(() => {
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
        }
      })
      .catch(error => console.error(error));
  };

  const organisationConfigSettingKeys = {
    approvalWorkflow: "enableApprovalWorkflow",
    draftSave: "saveDrafts"
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
            checked={orgSettings[organisationConfigSettingKeys.approvalWorkflow]}
            onChange={event =>
              onSettingsChange(organisationConfigSettingKeys.approvalWorkflow, event.target.checked)
            }
            name="Approval workflow"
            toolTipKey={"ADMIN_APPROVAL_WORKFLOW"}
          />
        </Grid>
        <Grid item>
          <AvniSwitch
            checked={orgSettings[organisationConfigSettingKeys.draftSave]}
            onChange={event =>
              onSettingsChange(organisationConfigSettingKeys.draftSave, event.target.checked)
            }
            name="Draft save"
            toolTipKey={"ADMIN_SAVE_DRAFT"}
          />
        </Grid>
      </Grid>
    </Grid>
  ) : (
    <div />
  );
};
