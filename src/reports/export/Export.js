import { styled } from "@mui/material/styles";
import { FormControl, FormLabel, Typography, Grid, Button, Paper, Box, FormGroup, FormControlLabel, Checkbox } from "@mui/material";
import { useEffect, useState, useReducer, Fragment } from "react";
import { useSelector, useDispatch } from "react-redux";
import api from "../api";
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

const StyledBox = styled(Box)(({ theme }) => ({
  border: "1px solid #ddd",
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2)
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  marginBottom: theme.spacing(2)
}));

const StyledGrid = styled(Grid)({
  display: "flex",
  justifyContent: "flex-start",
  alignItems: "center",
  flexWrap: "nowrap"
});

const StyledWarningText = styled(Typography)(({ theme }) => ({
  fontSize: "20px",
  fontWeight: "500",
  marginLeft: theme.spacing(1.25),
  marginBottom: theme.spacing(1.25)
}));

const StyledErrorText = styled("div")(({ theme }) => ({
  color: "red",
  fontSize: "12px"
}));

const Export = () => {
  const dispatch = useDispatch();
  const operationalModules = useSelector(state => state.reports.operationalModules);
  const exportJobStatuses = useSelector(state => state.reports.exportJobStatuses);
  const userInfo = useSelector(state => state.app.userInfo);
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(getOperationalModules());
  }, [dispatch]);

  const [exportRequest, dispatchFun] = useReducer(ExportReducer, initialState);
  const [enableExport, setEnableExport] = useState(false);
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
  const dispatchExport = (type, payload) => dispatchFun({ type, payload });
  const subjectTypes = _.get(operationalModules, "subjectTypes");
  const { programOptions, encounterTypeOptions } = applicableOptions(operationalModules, exportRequest);

  const onStartExportHandler = async () => {
    const [ok, error] = await api.startExportJob(getRequestBody(exportRequest));
    if (!ok && error) {
      alert(error);
    }
    setTimeout(() => dispatch(getUploadStatuses(0)), 1000);
  };

  const renderAddressLevel = () => {
    return (
      <Grid container direction="row">
        <Grid size={12}>
          <AddressLevelsByType
            label="Address (Leave blank to consider all)"
            addressLevelsIds={addressLevelIds}
            setAddressLevelsIds={ids => dispatchExport("addressLevelIds", ids)}
            setError={error => dispatchExport("AddressLevelError", error)}
          />
        </Grid>
        <Grid size={12}>
          <StyledErrorText>{addressLevelError}</StyledErrorText>
        </Grid>
      </Grid>
    );
  };

  useEffect(() => {
    const isValidReportType = !_.isNil(reportType);
    const isValidSubjectType = !_.isNil(subjectType);
    const isValidProgram = reportType === reportTypes.Registration || reportType === reportTypes.Encounter || !_.isNil(program);
    const isValidEncounterType = reportType !== reportTypes.Encounter || !_.isNil(encounterType);
    const isValidDate = !_.isNil(startDate) && !_.isNil(endDate);
    const isValidAddressLevel = _.isEmpty(addressLevelError);

    setEnableExport(
      isValidReportType && isValidSubjectType && isValidProgram && isValidEncounterType && isValidDate && isValidAddressLevel
    );
  }, [reportType, subjectType, program, encounterType, startDate, endDate, addressLevelError]);

  const hasExportPrivilege = UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.Analytics);

  if (!hasExportPrivilege) {
    return (
      <ScreenWithAppBar appbarTitle={t("export")} enableLeftMenuButton={true}>
        <DocumentationContainer filename={"Export.md"}>
          <StyledWarningText>You don't have access to this functionality. Please contact your administrator.</StyledWarningText>
        </DocumentationContainer>
      </ScreenWithAppBar>
    );
  }

  return (
    <ScreenWithAppBar appbarTitle={t("export")} enableLeftMenuButton={true}>
      <DocumentationContainer filename={"Export.md"}>
        <StyledPaper>
          <Box p={3}>
            <Typography variant="h5" gutterBottom>
              {t("export")}
            </Typography>
            <StyledBox>
              <FormControl component="fieldset">
                <FormLabel component="legend">{t("reportType")}</FormLabel>
                <ReportTypes reportType={reportType} onChange={reportType => dispatchExport("reportType", reportType)} />
              </FormControl>
            </StyledBox>

            <StyledBox>
              <FormControl component="fieldset">
                <FormLabel component="legend">{t("subjectType")}</FormLabel>
                <Radio
                  value={subjectType}
                  options={subjectTypes}
                  labelKey="name"
                  valueKey="uuid"
                  onChange={subjectType => dispatchExport("subjectType", subjectType)}
                />
              </FormControl>
            </StyledBox>

            {reportType === reportTypes.Registration && (
              <RegistrationType
                subjectType={subjectType}
                program={program}
                onChange={program => dispatchExport("program", program)}
                programOptions={programOptions}
              />
            )}

            {reportType === reportTypes.Enrolment && (
              <EnrolmentType program={program} onChange={program => dispatchExport("program", program)} programOptions={programOptions} />
            )}

            {reportType === reportTypes.Encounter && (
              <EncounterType
                encounterType={encounterType}
                onChange={encounterType => dispatchExport("encounterType", encounterType)}
                encounterTypeOptions={encounterTypeOptions}
              />
            )}

            {reportType === reportTypes.GroupSubject && (
              <GroupSubjectType
                program={program}
                onChange={program => dispatchExport("program", program)}
                programOptions={programOptions}
              />
            )}

            <StyledBox>
              <FormControl component="fieldset">
                <FormLabel component="legend">{t("dateRange")}</FormLabel>
                <StyledGrid container spacing={2}>
                  <Grid size={6}>
                    <input
                      type="date"
                      value={startDate || ""}
                      onChange={e => dispatchExport("startDate", e.target.value)}
                      style={{ width: "100%", padding: "8px" }}
                    />
                  </Grid>
                  <Grid size={6}>
                    <input
                      type="date"
                      value={endDate || ""}
                      onChange={e => dispatchExport("endDate", e.target.value)}
                      style={{ width: "100%", padding: "8px" }}
                    />
                  </Grid>
                </StyledGrid>
              </FormControl>
            </StyledBox>

            <StyledBox>{renderAddressLevel()}</StyledBox>

            <StyledBox>
              <FormGroup>
                <FormControlLabel
                  control={<Checkbox checked={includeVoided} onChange={e => dispatchExport("includeVoided", e.target.checked)} />}
                  label={t("includeVoided")}
                />
              </FormGroup>
            </StyledBox>

            <Button variant="contained" color="primary" disabled={!enableExport} onClick={onStartExportHandler}>
              {t("startExport")}
            </Button>
          </Box>
        </StyledPaper>

        <JobStatus operationalModules={operationalModules} />
      </DocumentationContainer>
    </ScreenWithAppBar>
  );
};

export default Export;
