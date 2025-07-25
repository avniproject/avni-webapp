import { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import ScreenWithAppBar from "../common/components/ScreenWithAppBar";
import { reportSideBarOptions } from "./Common";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  CircularProgress,
  Chip
} from "@mui/material";
import MetabaseSVG from "./Metabase_icon.svg";
import { OpenInNew, Delete } from "@mui/icons-material";
import { debounce } from "lodash";
import { httpClient } from "../common/utils/httpClient";
import MetabaseSetupStatus from "./domain/MetabaseSetupStatus";
import { CopyToClipboard } from "react-copy-to-clipboard/lib/Component";

const StyledCard = styled(Card)({
  maxWidth: 600,
  backgroundColor: "#FFF",
  padding: "20px",
  position: "relative"
});

const StyledMetabaseHeader = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "0px",
  marginBottom: "8px"
});

const StyledSetupButtonContainer = styled(Box)({
  position: "absolute",
  top: 20,
  right: 20,
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginRight: 10
});

const StyledButton = styled(Button)({
  backgroundColor: "#4995ec",
  color: "#FFF",
  "&:hover": {
    backgroundColor: "#4995ec"
  }
});

const StyledDeleteButton = styled(Button)(({ theme }) => ({
  color: theme.palette.error.main,
  float: "right"
}));

const StyledButtonsContainer = styled(Box)({
  marginTop: "30px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginRight: 10
});

const StyledMetabaseLink = styled("a")({
  display: "inline-flex",
  alignItems: "center",
  fontSize: "10px",
  color: "#757575",
  textDecoration: "none",
  margin: 0
});

const StyledRedirectIcon = styled(OpenInNew)({
  fontSize: "1rem",
  marginLeft: "5px"
});

const StyledMetabaseTitle = styled(Typography)({
  variant: "h4",
  marginBottom: 0,
  padding: 0
});

const StyledDescriptionTypography = styled(Typography)(({ theme }) => ({
  variant: "body2",
  color: theme.palette.text.secondary
}));

const StyledDurationTypography = styled(Typography)(({ theme }) => ({
  variant: "body1",
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(2.5)
}));

const StyledWarningTypography = styled(Typography)(({ theme }) => ({
  variant: "h6",
  color: theme.palette.warning.main
}));

const StyledErrorTypography = styled(Typography)(({ theme }) => ({
  variant: "h6",
  color: theme.palette.error.main
}));

const StyledErrorDetailTypography = styled(Typography)(({ theme }) => ({
  variant: "body2",
  color: theme.palette.error.main
}));

const StyledResourcesTypography = styled(Typography)(({ theme }) => ({
  variant: "body1",
  marginTop: theme.spacing(3.75)
}));

const StyledNoResourcesTypography = styled(Typography)(({ theme }) => ({
  variant: "body2",
  marginTop: theme.spacing(1.25)
}));

const StyledChipContainer = styled(Box)({
  display: "flex",
  flexWrap: "wrap",
  marginTop: "10px"
});

const StyledChip = styled(Chip)({
  marginRight: "5px",
  marginBottom: "5px"
});

const StyledProgressContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "10px"
});

async function getStatusResponse() {
  const statusResponse = (await httpClient.get("/web/metabase/status")).data;
  return MetabaseSetupStatus.fromStatusResponse(statusResponse);
}

// not sure why useState didn't work for maintaining this state
let intervalId = null;

const SelfServiceReports = () => {
  const [statusResponse, setStatusResponse] = useState(
    MetabaseSetupStatus.createUnknownStatus()
  );
  const [
    isBusyCallingCreateQuestionOnly,
    setIsBusyCallingCreateQuestionOnly
  ] = useState(false);
  const [isBusyCallingSetup, setIsBusyCallingSetup] = useState(false);
  const [isBusyCallingTearDown, setIsBusyCallingTearDown] = useState(false);

  useEffect(() => {
    updateStatus().then(status => {
      if (status.isAnyJobInProgress()) {
        pollSetupStatus();
      }
    });
  }, []);

  async function performAction(url) {
    await httpClient.post(url);
    pollSetupStatus();
  }

  async function updateStatus() {
    const statusResponse = await getStatusResponse();
    setStatusResponse(statusResponse);
    return statusResponse;
  }

  const pollSetupStatus = debounce(async () => {
    intervalId = setInterval(() => {
      updateStatus().then(status => {
        if (!status.isAnyJobInProgress() && intervalId) {
          clearInterval(intervalId);
          setIsBusyCallingCreateQuestionOnly(false);
          setIsBusyCallingSetup(false);
          setIsBusyCallingTearDown(false);
          intervalId = null;
        }
      });
    }, 5000);
  }, 500);

  const tearDownMetabase = debounce(async () => {
    setIsBusyCallingTearDown(true);
    await performAction("/web/metabase/teardown");
  }, 500);

  const setupReports = debounce(async () => {
    setIsBusyCallingSetup(true);
    await performAction("/web/metabase/setup");
  }, 500);

  const refreshReports = debounce(async () => {
    setIsBusyCallingCreateQuestionOnly(true);
    await performAction("/web/metabase/update-questions");
  }, 500);

  if (statusResponse.status === MetabaseSetupStatus.Unknown) {
    return <>Loading...</>;
  }

  const isTestEnvironment = ["prerelease", "staging"].includes(
    statusResponse.avniEnvironment
  );
  const isBusyCallingAnyAction =
    isBusyCallingCreateQuestionOnly ||
    isBusyCallingSetup ||
    isBusyCallingTearDown;
  const showSetupButton =
    statusResponse.canStartSetup() && !isBusyCallingAnyAction;
  const showDisabledSetupButton = isBusyCallingSetup;
  const showDeleteButton =
    (statusResponse.isSetupComplete() || isTestEnvironment) &&
    !isBusyCallingAnyAction;
  const showDisabledDeleteButton = isBusyCallingTearDown;
  const showRefreshButton =
    statusResponse.isSetupComplete() && !isBusyCallingAnyAction;
  const showDisabledRefreshButton = isBusyCallingCreateQuestionOnly;
  const showExploreButton =
    statusResponse.isSetupComplete() && !isBusyCallingAnyAction;
  const showProgressSpinner =
    statusResponse.isAnyJobInProgress() || isBusyCallingAnyAction;
  const showErrorMessage = statusResponse.hasErrorMessage();

  return (
    <ScreenWithAppBar
      appbarTitle="Self Service Reports"
      enableLeftMenuButton={true}
      sidebarOptions={reportSideBarOptions}
    >
      <StyledCard>
        <CardContent>
          <Box display="flex" flexDirection="column">
            <Box display="flex" flexDirection="row">
              <img
                src={MetabaseSVG}
                alt="Metabase logo"
                style={{ height: 50, width: 50 }}
              />
              <StyledMetabaseHeader>
                <StyledMetabaseTitle component="h4">
                  Metabase
                </StyledMetabaseTitle>
                <StyledMetabaseLink
                  href="https://metabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  metabase.com
                  <StyledRedirectIcon />
                </StyledMetabaseLink>
              </StyledMetabaseHeader>
              {showSetupButton && (
                <StyledSetupButtonContainer>
                  <StyledButton
                    onClick={setupReports}
                    disabled={statusResponse.isSetupInProgress()}
                  >
                    Setup Reports
                  </StyledButton>
                </StyledSetupButtonContainer>
              )}
              {showDisabledSetupButton && (
                <StyledSetupButtonContainer>
                  <StyledButton disabled>Setup Reports</StyledButton>
                </StyledSetupButtonContainer>
              )}
            </Box>
            <StyledDescriptionTypography component="p">
              Metabase provides a graphical interface to create business
              intelligence and analytics graphs in minutes. Avni integrates with
              Metabase to support ad hoc and self-serviced reports.
            </StyledDescriptionTypography>
            <StyledDurationTypography component="p">
              {`Setup and Refresh reports may take up to ${statusResponse.getExpectedDurationInMinutes()} minutes`}
            </StyledDurationTypography>
            {statusResponse.status === MetabaseSetupStatus.EtlNotRun && (
              <>
                <br />
                <StyledWarningTypography>
                  Analytics database not present. Please contact support.
                </StyledWarningTypography>
              </>
            )}
            <Box display="flex" flexDirection="row-reverse">
              {showDeleteButton && (
                <StyledButtonsContainer>
                  <StyledDeleteButton onClick={tearDownMetabase}>
                    <Delete /> Delete
                  </StyledDeleteButton>
                </StyledButtonsContainer>
              )}
              {showDisabledDeleteButton && (
                <StyledButtonsContainer>
                  <Button disabled>
                    <Delete /> Delete
                  </Button>
                </StyledButtonsContainer>
              )}
              {showRefreshButton && (
                <StyledSetupButtonContainer>
                  <StyledButton onClick={refreshReports}>
                    Refresh Reports
                  </StyledButton>
                </StyledSetupButtonContainer>
              )}
              {showDisabledRefreshButton && (
                <StyledSetupButtonContainer>
                  <StyledButton disabled>Refresh Reports</StyledButton>
                </StyledSetupButtonContainer>
              )}
              {showExploreButton && (
                <StyledButtonsContainer>
                  <StyledButton
                    href="https://reporting.avniproject.org"
                    target="_blank"
                  >
                    Explore Your Data
                  </StyledButton>
                </StyledButtonsContainer>
              )}
              {showProgressSpinner && (
                <StyledButtonsContainer>
                  <StyledProgressContainer>
                    <CircularProgress size={24} />
                    <Box />
                  </StyledProgressContainer>
                </StyledButtonsContainer>
              )}
            </Box>
            {showErrorMessage && (
              <>
                <StyledErrorTypography>
                  Last attempt failed with error
                </StyledErrorTypography>
                <StyledErrorDetailTypography>
                  {statusResponse.getShortErrorMessage()}
                </StyledErrorDetailTypography>
                <br />
                <CopyToClipboard text={statusResponse.getErrorMessage()}>
                  <button>Copy error to clipboard</button>
                </CopyToClipboard>
              </>
            )}
            {isTestEnvironment && (
              <>
                <StyledResourcesTypography>
                  Available Resources (note setup will run even after you see
                  all three resources)
                </StyledResourcesTypography>
                {statusResponse.resources.length > 0 ? (
                  <StyledChipContainer>
                    {statusResponse.resources.map(r => (
                      <StyledChip key={r} label={r} />
                    ))}
                  </StyledChipContainer>
                ) : (
                  <StyledNoResourcesTypography>
                    No resources present for this organisation.
                  </StyledNoResourcesTypography>
                )}
              </>
            )}
          </Box>
        </CardContent>
      </StyledCard>
    </ScreenWithAppBar>
  );
};

export default SelfServiceReports;
