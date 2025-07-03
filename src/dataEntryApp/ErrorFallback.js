import React from "react";
import { styled } from '@mui/material/styles';
import { Button, AppBar, Toolbar, Typography } from "@mui/material";
import _, { isFunction } from "lodash";
import logo from "../formDesigner/styles/images/avniLogo.png";
import Colors from "./Colors";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  position: "relative",
  background: "white",
}));

const StyledContainer = styled('div')(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  marginTop: "50px",
  marginBottom: "50px",
  marginRight: "20%",
  marginLeft: "20%",
}));

const StyledButtonContainer = styled('div')(({ theme }) => ({
  marginTop: "50px",
  flex: 1,
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(2.5),
}));

const StyledErrorContainer = styled('div')(({ theme }) => ({
  padding: "5px",
  backgroundColor: Colors.HighlightBackgroundColor,
  border: "2px solid #d1d2d2",
  borderRadius: 5,
  marginTop: "10px",
}));

function ErrorItem({ fieldName, fieldValue }) {
  return (
    <>
      <Typography variant="h6">{fieldName}</Typography>
      {fieldValue && (
        <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
          {fieldValue}
        </Typography>
      )}
    </>
  );
}

export function ErrorFallback({ error, onClose }) {
  const [showError, setShowError] = React.useState(false);

  const closeDialogIfRequired = () => {
    if (isFunction(onClose)) {
      onClose();
    }
  };

  const reload = () => {
    closeDialogIfRequired();
    window.location.reload();
  };

  const appHome = () => {
    closeDialogIfRequired();
    const url = "#/";
    window.open(`${window.location.origin}/${url}`, "_self");
    window.location.reload();
  };

  const clearSession = () => {
    closeDialogIfRequired();
    localStorage.clear();
    appHome();
  };

  return (
    <>
      <StyledAppBar>
        <Toolbar>
          <Typography variant="h6" sx={{ whiteSpace: "nowrap" }}>
            <img src={logo} alt="logo" />
          </Typography>
        </Toolbar>
      </StyledAppBar>
      <StyledContainer>
        <Typography variant="h1" sx={{ mb: 1 }}>
          oops!
        </Typography>
        <Typography variant="h4" sx={{ mb: 1 }}>
          There was a problem when loading this page. Please contact administrator.
        </Typography>
        {!showError && (
          <Button onClick={() => setShowError(true)} variant="contained">
            Show error details
          </Button>
        )}
        {showError && (
          <Button
            onClick={() =>
              navigator.clipboard.writeText(
                `Message: ${_.get(error, "message")}\n\nStack: ${_.get(error, "stack")}\n\nSaga Stack: ${_.get(error, "sagaStack")}`
              )
            }
            variant="contained"
          >
            Copy Error
          </Button>
        )}
        {showError && (
          <StyledErrorContainer>
            <ErrorItem fieldName="Message" fieldValue={error.message} />
            <ErrorItem fieldName="Error Stack" fieldValue={error.stack} />
            {error["sagaStack"] && <ErrorItem fieldName="Saga Stack" fieldValue={error["sagaStack"]} />}
          </StyledErrorContainer>
        )}
        <StyledButtonContainer>
          <Button variant="contained" color="primary" onClick={appHome}>
            Home
          </Button>
          <Button variant="contained" color="primary" onClick={reload}>
            Reload
          </Button>
          <Button variant="contained" color="primary" onClick={clearSession}>
            Clear session & reload (will logout)
          </Button>
        </StyledButtonContainer>
      </StyledContainer>
    </>
  );
}