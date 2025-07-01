import { makeStyles } from "@mui/styles";
import { Typography, GridLegacy as Grid, Button, Paper, Box } from "@mui/material";
import React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import ScreenWithAppBar from "../../common/components/ScreenWithAppBar";
import { getOperationalModules, getUploadStatuses } from "../reducers";
import JobStatus from "../components/export/JobStatus";
import { DocumentationContainer } from "../../common/components/DocumentationContainer";
import { reportSideBarOptions } from "../Common";
import { ExportRequestBody } from "../components/export/ExportRequestBody";
import api from "../api";
import { Privilege } from "openchs-models";
import UserInfo from "../../common/model/UserInfo";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles(theme => ({
  root: {},
  button: {
    color: "#3f51b5"
  },
  warningText: {
    fontSize: "20px",
    fontWeight: "500",
    marginLeft: 10,
    marginBottom: 10
  }
}));

const NewExport = ({ operationalModules, getOperationalModules, getUploadStatuses, exportJobStatuses, userInfo }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  React.useEffect(() => {
    getOperationalModules();
  }, []);

  const [customRequest, setCustomRequest] = React.useState(undefined);
  const exportRequest = require("./ExportV2ReferenceRequest.json");

  function safeParseCustomRequestJson() {
    try {
      return JSON.parse(customRequest);
    } catch (error) {
      alert(error);
      return null;
    }
  }

  const onStartExportHandler = async () => {
    let parsedJsonRequest = safeParseCustomRequestJson();
    if (!parsedJsonRequest) {
      return;
    }
    const [ok, error] = await api.startExportV2Job(parsedJsonRequest);
    if (!ok && error) {
      alert(error);
    }
    setTimeout(() => getUploadStatuses(0), 1000);
  };
  const allowReportGeneration = UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.Analytics);
  return (
    <ScreenWithAppBar appbarTitle={`New Longitudinal Export`} enableLeftMenuButton={true} sidebarOptions={reportSideBarOptions}>
      {operationalModules && (
        <div>
          <Box
            sx={{
              border: 1,
              mb: 2,
              borderColor: "#ddd",
              p: 2
            }}
          >
            <DocumentationContainer filename={"Report.md"}>
              {allowReportGeneration && (
                <ExportRequestBody dispatch={setCustomRequest} customRequest={customRequest} exportRequest={exportRequest} />
              )}
              {allowReportGeneration && (
                <Grid
                  container
                  direction="row"
                  sx={{
                    justifyContent: "flex-start",
                    alignItems: "baseline"
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    aria-haspopup="false"
                    onClick={onStartExportHandler}
                    disabled={!customRequest}
                    className={classes.item}
                  >
                    Generate Export
                  </Button>
                  <Typography component={"span"} className={classes.warningText}>
                    {t("newLongitudinalExportWarningMessage")}
                  </Typography>
                </Grid>
              )}
            </DocumentationContainer>
          </Box>
          <Grid item>
            <Paper style={{ marginBottom: 100 }}>
              <JobStatus exportJobStatuses={exportJobStatuses} operationalModules={operationalModules} />
            </Paper>
          </Grid>
        </div>
      )}
    </ScreenWithAppBar>
  );
};
const mapStateToProps = state => ({
  operationalModules: state.reports.operationalModules,
  exportJobStatuses: state.reports.exportJobStatuses,
  userInfo: state.app.userInfo
});
export default withRouter(
  connect(
    mapStateToProps,
    { getOperationalModules, getUploadStatuses }
  )(NewExport)
);
