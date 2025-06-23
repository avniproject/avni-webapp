import { makeStyles } from "@mui/styles";
import { FormControl, FormLabel, Typography, Grid, Button, Paper, Box, FormGroup, FormControlLabel, Checkbox } from "@mui/material";
import React from "react";
import api from "../api";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import ScreenWithAppBar from "../../common/components/ScreenWithAppBar";
import { getOperationalModules, getUploadStatuses } from "../reducers";
import JobStatus from "../components/export/JobStatus";
import _ from "lodash";
import ReportTypes, { reportTypes } from "./ReportTypes";
import Radio from "../../dataEntryApp/components/Radio";
import { DocumentationContainer } from "../../common/components/DocumentationContainer";
import AddressLevelsByType from "../../common/components/AddressLevelsByType";
import { reportSideBarOptions } from "../Common";
import { applicableOptions, ExportReducer, getRequestBody, initialState } from "./reducer/ExportReducer";
import { RegistrationType } from "../components/export/RegistrationType";
import { EnrolmentType } from "../components/export/EnrolmentType";
import { EncounterType } from "../components/export/EncounterType";
import { GroupSubjectType } from "../components/export/GroupSubjectType";
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

const Export = ({ operationalModules, getOperationalModules, getUploadStatuses, exportJobStatuses, userInfo }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  React.useEffect(() => {
    getOperationalModules();
  }, []);

  const [exportRequest, dispatchFun] = React.useReducer(ExportReducer, initialState);
  const [enableExport, setEnableExport] = React.useState(false);
  const {
    reportType,
    subjectType,
    program,
    encounterType,
    startDate,
    endDate,
    addressLevelIds,
    addressLevelError,
    includeVoided
  } = exportRequest;
  const dispatch = (type, payload) => dispatchFun({ type, payload });
  const subjectTypes = _.get(operationalModules, "subjectTypes");
  const { programOptions, encounterTypeOptions } = applicableOptions(operationalModules, exportRequest);

  const onStartExportHandler = async () => {
    const [ok, error] = await api.startExportJob(getRequestBody(exportRequest));
    if (!ok && error) {
      alert(error);
    }
    setTimeout(() => getUploadStatuses(0), 1000);
  };

  const renderAddressLevel = () => {
    return (
      <Grid container direction={"row"}>
        <Grid item xs={12}>
          <AddressLevelsByType
            label={"Address (Leave blank to consider all)"}
            addressLevelsIds={addressLevelIds}
            setAddressLevelsIds={ids => dispatch("addressLevelIds", ids)}
            setError={error => dispatch("AddressLevelError", error)}
          />
        </Grid>
        <Grid item xs={12}>
          <div style={{ color: "red", marginBottom: "10px" }}>{addressLevelError}</div>
        </Grid>
      </Grid>
    );
  };

  const renderIncludeVoided = () => (
    <FormControlLabel
      control={
        <Checkbox
          color={"primary"}
          checked={includeVoided}
          name="Include voided entries"
          onChange={event => dispatch("includeVoided", event.target.checked)}
        />
      }
      label="Include voided entries"
    />
  );

  const onReportTypeChange = type => {
    dispatch("reportType", type);
    setEnableExport(false);
  };

  const RenderReportTypes = () => {
    return (
      <FormControl component="fieldset">
        <FormLabel component="legend">Report Type</FormLabel>
        <FormGroup row>
          {ReportTypes.names.map(type => (
            <FormControlLabel
              key={type.name}
              control={<Radio checked={type.name === reportType.name} onChange={() => onReportTypeChange(type)} value={type.name} />}
              label={type.name}
            />
          ))}
        </FormGroup>
      </FormControl>
    );
  };

  const commonProps = { dispatch, startDate, endDate, subjectType, subjectTypes, setEnableExport };
  const reportTypeMap = {
    [reportTypes.Registration]: <RegistrationType {...commonProps} />,
    [reportTypes.Enrolment]: <EnrolmentType {...commonProps} programOptions={programOptions} program={program} />,
    [reportTypes.Encounter]: (
      <EncounterType
        {...commonProps}
        programOptions={programOptions}
        program={program}
        encounterTypeOptions={encounterTypeOptions}
        encounterType={encounterType}
      />
    ),
    [reportTypes.GroupSubject]: <GroupSubjectType {...commonProps} />
  };

  const renderReportTypeOptions = () => {
    return reportType.name ? reportTypeMap[reportType.name] : <React.Fragment />;
  };

  const allowReportGeneration = UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.Analytics);

  return (
    <ScreenWithAppBar appbarTitle={`Longitudinal Export`} enableLeftMenuButton={true} sidebarOptions={reportSideBarOptions}>
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
                <Grid>
                  {RenderReportTypes()}
                  {renderReportTypeOptions()}
                  {!_.isEmpty(reportType.name) && renderAddressLevel()}
                  {!_.isEmpty(reportType.name) && renderIncludeVoided()}
                </Grid>
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
                    disabled={!enableExport}
                    className={classes.item}
                  >
                    Generate Export
                  </Button>
                  <Typography component={"span"} className={classes.warningText}>
                    {t("legacyLongitudinalExportWarningMessage")}
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
  )(Export)
);
