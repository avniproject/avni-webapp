import { makeStyles } from "@material-ui/core";
import React from "react";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import ScreenWithAppBar from "../../common/components/ScreenWithAppBar";
import { getOperationalModules, getUploadStatuses } from "../reducers";
import JobStatus from "../components/export/JobStatus";
import Paper from "@material-ui/core/Paper";
import Box from "@material-ui/core/Box";
import { DocumentationContainer } from "../../common/components/DocumentationContainer";
import { reportSideBarOptions } from "../Common";
import { ExportRequestBody } from "../components/export/ExportRequestBody";
import api from "../api";

const useStyles = makeStyles(theme => ({
  root: {},
  button: {
    color: "#3f51b5"
  }
}));

const NewExport = ({
  operationalModules,
  getOperationalModules,
  getUploadStatuses,
  exportJobStatuses
}) => {
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

  return (
    <ScreenWithAppBar
      appbarTitle={`New Longitudinal Export`}
      enableLeftMenuButton={true}
      sidebarOptions={reportSideBarOptions}
    >
      {operationalModules && (
        <div>
          <Box border={1} mb={2} borderColor={"#ddd"} p={2}>
            <DocumentationContainer filename={"Report.md"}>
              <ExportRequestBody
                dispatch={setCustomRequest}
                customRequest={customRequest}
                exportRequest={exportRequest}
              />
              <Grid container direction="row" justify="flex-start">
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
              </Grid>
            </DocumentationContainer>
          </Box>
          <Grid item>
            <Paper style={{ marginBottom: 100 }}>
              <JobStatus
                exportJobStatuses={exportJobStatuses}
                operationalModules={operationalModules}
              />
            </Paper>
          </Grid>
        </div>
      )}
    </ScreenWithAppBar>
  );
};

const mapStateToProps = state => ({
  operationalModules: state.reports.operationalModules,
  exportJobStatuses: state.reports.exportJobStatuses
});

export default withRouter(
  connect(
    mapStateToProps,
    { getOperationalModules, getUploadStatuses }
  )(NewExport)
);
