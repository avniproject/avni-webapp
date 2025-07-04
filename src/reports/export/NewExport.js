import { styled } from "@mui/material/styles";
import { Typography, Grid, Button, Paper, Box } from "@mui/material";
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
import { useState, useEffect } from "react";

const StyledButton = styled(Button)({
  color: "#3f51b5"
});

const StyledTypography = styled(Typography)(({ theme }) => ({
  fontSize: "20px",
  fontWeight: "500",
  marginLeft: theme.spacing(1.25), // 10px
  marginBottom: theme.spacing(1.25) // 10px
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  marginBottom: theme.spacing(12.5) // 100px
}));

const NewExport = ({ operationalModules, getOperationalModules, getUploadStatuses, exportJobStatuses, userInfo }) => {
  const { t } = useTranslation();

  useEffect(() => {
    getOperationalModules();
  }, []);

  const [customRequest, setCustomRequest] = useState(undefined);
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
                <Grid container direction="row" sx={{ justifyContent: "flex-start", alignItems: "baseline" }}>
                  <StyledButton
                    variant="contained"
                    color="primary"
                    aria-haspopup="false"
                    onClick={onStartExportHandler}
                    disabled={!customRequest}
                  >
                    Generate Export
                  </StyledButton>
                  <StyledTypography component="span">{t("newLongitudinalExportWarningMessage")}</StyledTypography>
                </Grid>
              )}
            </DocumentationContainer>
          </Box>
          <Grid>
            <StyledPaper>
              <JobStatus exportJobStatuses={exportJobStatuses} operationalModules={operationalModules} />
            </StyledPaper>
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
