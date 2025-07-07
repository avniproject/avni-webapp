import { useState, useEffect } from "react";
import { Box, Grid, Button, MenuItem, IconButton } from "@mui/material";
import { DocumentationContainer } from "../common/components/DocumentationContainer";
import { Title } from "react-admin";
import { AvniTextField } from "../common/components/AvniTextField";
import { AvniSelect } from "../common/components/AvniSelect";
import { SaveComponent } from "../common/components/SaveComponent";
import api from "./api";
import { Edit } from "@mui/icons-material";
import { isNil, isEmpty } from "lodash";
import CustomizedSnackbar from "../formDesigner/components/CustomizedSnackbar";

const Msg91Config = () => {
  const [msg91Config, setMsg91Config] = useState({
    authKey: "",
    otpSmsTemplateId: "",
    otpLength: 4
  });
  useEffect(() => {
    api.getMsg91Config().then(response => {
      setMsg91Config(response);
      setAuthKeyChanged(isNil(response.authKey));
    });
  }, []);

  const [authKeyChanged, setAuthKeyChanged] = useState(false);
  const [authKeyVerified, setAuthKeyVerified] = useState(false);
  const [dataChanged, setDataChanged] = useState(false);
  const [messageStatus, setMessageStatus] = useState({ message: "", display: false });
  const [snackBarStatus, setSnackBarStatus] = useState(true);

  const showSnackBar = snackBarMessage => {
    setMessageStatus({ message: snackBarMessage, display: true });
    setSnackBarStatus(true);
  };

  const verifyAuthKey = () => {
    api.checkMsg91Authkey(msg91Config).then(response => {
      const [response_data, error] = response;
      if (!response_data && error) {
        alert(error);
      } else {
        if (!response_data.success) {
          alert("Error verifying Auth Key: " + response_data.msg91Response.message);
        } else {
          showSnackBar("Auth Key Verified");
          setAuthKeyVerified(true);
          setAuthKeyChanged(false);
        }
      }
    });
  };

  const onSubmit = () => {
    return api
      .updateMsg91Config(
        authKeyVerified
          ? msg91Config
          : {
              otpSmsTemplateId: msg91Config.otpSmsTemplateId,
              otpLength: msg91Config.otpLength
            }
      )
      .then(response => {
        const [response_data, error] = response;
        if (!response_data && error) {
          alert(error);
        } else {
          showSnackBar("Configuration saved");
        }
      });
  };

  const onAuthKeyChange = authKey => {
    setAuthKeyChanged(true);
    setMsg91Config({ ...msg91Config, authKey: authKey });
  };
  const onOtpSmsTemplateIdChange = otpSmsTemplateId => {
    setDataChanged(true);
    setMsg91Config({ ...msg91Config, otpSmsTemplateId: otpSmsTemplateId });
  };
  const onOtpLengthChange = otpLength => {
    setDataChanged(true);
    setMsg91Config({ ...msg91Config, otpLength: parseInt(otpLength) });
  };

  const setEditMode = () => {
    setAuthKeyChanged(true);
    onAuthKeyChange("");
  };

  return (
    <>
      <Box
        sx={{
          boxShadow: 2,
          p: 3,
          bgcolor: "background.paper"
        }}
      >
        <DocumentationContainer filename={"PhoneNumberVerification.md"}>
          <Title title={"Phone Number Verification"} />
          <Grid container spacing={2} style={{ width: "100%" }}>
            <Grid container spacing={1}>
              <Grid size={5}>
                <AvniTextField
                  toolTipKey={"ADMIN_PHONE_VERIFICATION_MSG91AUTHKEY"}
                  id="authKey"
                  label={"Msg91 Auth Key*"}
                  value={msg91Config.authKey}
                  placeholder={msg91Config.authKey}
                  autoComplete="off"
                  onChange={event => onAuthKeyChange(event.target.value)}
                  style={{ minWidth: 300, width: "100%" }}
                  disabled={!authKeyChanged}
                />
              </Grid>
              <Grid size={2}>
                <div className="container" style={{ alignItems: "left", float: "left", width: "100%" }}>
                  {!authKeyChanged ? (
                    <IconButton onClick={() => setEditMode()} size="large">
                      <Edit />
                    </IconButton>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => verifyAuthKey(msg91Config.authKey)}
                      disabled={isEmpty(msg91Config.authKey)}
                    >
                      Verify
                    </Button>
                  )}
                </div>
              </Grid>
            </Grid>
            <Grid size={10}>
              <AvniTextField
                toolTipKey={"ADMIN_PHONE_VERIFICATION_MSG91TEMPLATEID"}
                id="otpSmsTemplateId"
                label={"Msg91 OTP Template Id*"}
                value={msg91Config.otpSmsTemplateId}
                autoComplete="off"
                onChange={event => onOtpSmsTemplateIdChange(event.target.value)}
                style={{ width: 300 }}
              />
            </Grid>
            <Grid size={10}>
              <AvniSelect
                toolTipKey={"ADMIN_PHONE_VERIFICATION_OTPLENGTH"}
                label={"OTP Length"}
                value={msg91Config.otpLength || "4"}
                options={["4", "5", "6", "7", "8", "9"].map(otpLengthValue => {
                  return (
                    <MenuItem key={otpLengthValue} value={otpLengthValue}>
                      {otpLengthValue}
                    </MenuItem>
                  );
                })}
                onChange={event => onOtpLengthChange(event.target.value)}
                style={{ width: 100 }}
              />
            </Grid>
            <Grid size={10}>
              <SaveComponent name="save" onSubmit={onSubmit} disabledFlag={authKeyChanged ? !authKeyVerified : !dataChanged} />
            </Grid>
          </Grid>
          {messageStatus.display && (
            <CustomizedSnackbar
              message={messageStatus.message}
              getDefaultSnackbarStatus={status => setSnackBarStatus(status)}
              defaultSnackbarStatus={snackBarStatus}
            />
          )}
        </DocumentationContainer>
      </Box>
    </>
  );
};
export default Msg91Config;
