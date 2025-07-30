import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  Paper,
  InputAdornment,
  Button,
  Link,
  Typography,
  Stack
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AvniLogo from "../../avni-logo-black.png";
import { RemoveRedEye } from "@mui/icons-material";
import { useEffect, useState } from "react";
import SideImage from "../../avni-background.jpeg";
import ApplicationContext from "../../ApplicationContext";
import { httpClient as http } from "common/utils/httpClient";

const StyledRootContainer = styled(Box)({
  display: "flex",
  height: "100vh",
  width: "100vw",
  margin: 0,
  padding: 0
});

const StyledImageContainer = styled(Box)(({ theme }) => ({
  width: "60%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor:
    theme.palette.mode === "light"
      ? theme.palette.grey[50]
      : theme.palette.grey[900]
}));

const StyledFormContainer = styled(Box)({
  width: "40%",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center"
});

const StyledSideImage = styled("img")({
  width: "100%",
  height: "100vh",
  objectFit: "cover"
});

const StyledPaper = styled(Paper)({
  backgroundColor: "#f0f2f0",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-start",
  height: "100vh",
  width: "100%"
});

const StyledLogoBox = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4)
}));

const StyledForm = styled("form")({
  width: "100%"
});

const StyledSubmitButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
  backgroundColor: "#f27510",
  color: "white",
  height: "56px",
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "#f27510"
  }
}));

const StyledReportButton = styled(Button)({
  backgroundColor: "#f27510",
  color: "white",
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "#f27510"
  }
});

const StyledEyeIcon = styled(RemoveRedEye)({
  cursor: "pointer"
});

const StyledCardActions = styled(CardActions)({
  justifyContent: "space-evenly"
});

const StyledReportTypography = styled(Typography)(({ theme }) => ({
  variant: "body2",
  color: "black"
}));

function SignInView({
  onSignIn,
  notifyInputChange,
  loading,
  onForgotPassword,
  disallowForgottenPasswordReset = false
}) {
  const [passwordIsMasked, setPasswordIsMasked] = useState(true);
  const autoComplete = ApplicationContext.isDevEnv() ? "on" : "off";
  const [reportingSystems, setReportingSystems] = useState(null);

  useEffect(() => {
    http
      .fetchJson("/config")
      .then(response => response.json)
      .then(responseData =>
        responseData.reportingSystems &&
        responseData.reportingSystems.length > 0
          ? setReportingSystems(responseData.reportingSystems)
          : null
      );
  }, []);

  return (
    <StyledRootContainer component="main">
      <StyledImageContainer>
        <StyledSideImage src={SideImage} alt="Avni Background" />
      </StyledImageContainer>
      <StyledFormContainer>
        <StyledPaper elevation={6}>
          <Stack spacing={3} sx={{ width: "100%" }}>
            <StyledLogoBox>
              <img src={AvniLogo} alt="logo" height="45px" />
            </StyledLogoBox>

            <Card>
              <CardHeader title="Sign in" />
              <CardContent>
                <StyledForm noValidate>
                  <TextField
                    variant="outlined"
                    inputProps={{
                      autoComplete: autoComplete,
                      form: { autoComplete: autoComplete }
                    }}
                    margin="normal"
                    required
                    fullWidth
                    id="username"
                    label="Username"
                    name="username"
                    type="text"
                    onChange={notifyInputChange}
                    autoFocus
                  />
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type={passwordIsMasked ? "password" : "text"}
                    onChange={notifyInputChange}
                    id="password"
                    autoComplete={autoComplete}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <StyledEyeIcon
                            onClick={() =>
                              setPasswordIsMasked(!passwordIsMasked)
                            }
                          />
                        </InputAdornment>
                      )
                    }}
                  />
                  <StyledSubmitButton
                    type="submit"
                    fullWidth
                    variant="contained"
                    onClick={event => {
                      event.preventDefault();
                      onSignIn();
                    }}
                    disabled={loading}
                  >
                    Sign In
                  </StyledSubmitButton>
                  <Grid
                    container
                    sx={{
                      display: disallowForgottenPasswordReset ? "none" : "flex"
                    }}
                  >
                    <Grid>
                      <Link href="#" variant="body2" onClick={onForgotPassword}>
                        Forgot password?
                      </Link>
                    </Grid>
                  </Grid>
                </StyledForm>
              </CardContent>
            </Card>

            {reportingSystems && (
              <Box>
                <ShowReport reportingSystems={reportingSystems} />
              </Box>
            )}
          </Stack>
        </StyledPaper>
      </StyledFormContainer>
    </StyledRootContainer>
  );
}

const ShowReport = ({ reportingSystems }) => (
  <Card>
    <CardHeader title="View Reports" />
    <CardContent>
      <StyledReportTypography>
        Avni provides reports using one of two different external BI tools -
        Metabase and Jasper Reports. You can find out the reports used by your
        organisation from your system administrator.
      </StyledReportTypography>
      <StyledReportTypography>
        <br />
        Choose your reporting system
      </StyledReportTypography>
    </CardContent>
    <StyledCardActions>
      {reportingSystems.map(({ name, url }) => (
        <ReportDetails key={name} name={name} url={url} />
      ))}
    </StyledCardActions>
  </Card>
);

const ReportDetails = ({ name, url }) => (
  <Link href={url}>
    <StyledReportButton size="small" variant="contained">
      {name}
    </StyledReportButton>
  </Link>
);

export default SignInView;
