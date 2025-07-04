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
  Typography
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AvniLogo from "../../avni-logo-black.png";
import { RemoveRedEye } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import SideImage from "../../avni-background.jpeg";
import ApplicationContext from "../../ApplicationContext";
import { httpClient as http } from "common/utils/httpClient";
import { useAuthenticator } from "@aws-amplify/ui-react";

const StyledRootGrid = styled(Grid)({
  height: "100vh"
});

const StyledImageGrid = styled(Grid)(({ theme }) => ({
  backgroundImage: `url(${SideImage})`,
  backgroundRepeat: "no-repeat",
  backgroundColor: theme.palette.mode === "light" ? theme.palette.grey[50] : theme.palette.grey[900],
  backgroundSize: "cover",
  backgroundPosition: "center"
}));

const StyledPaper = styled(Paper)({
  backgroundColor: "#f0f2f0"
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

const StyledReportButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#f27510",
  color: "white",
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "#f27510"
  }
}));

const StyledEyeIcon = styled(RemoveRedEye)({
  cursor: "pointer"
});

const StyledReportGrid = styled(Grid)({
  backgroundColor: "#f0f2f0"
});

const StyledCardActions = styled(CardActions)({
  justifyContent: "space-evenly"
});

const StyledReportTypography = styled(Typography)(({ theme }) => ({
  variant: "body2",
  color: theme.palette.secondary.main
}));

function SignInView({ onSignIn, notifyInputChange, loading, disallowForgottenPasswordReset = false }) {
  const { toForgotPassword } = useAuthenticator();
  const [passwordIsMasked, setPasswordIsMasked] = useState(true);
  const autoComplete = ApplicationContext.isDevEnv() ? "on" : "off";
  const [reportingSystems, setReportingSystems] = useState(null);

  useEffect(() => {
    http
      .fetchJson("/config")
      .then(response => response.json)
      .then(responseData =>
        responseData.reportingSystems && responseData.reportingSystems.length > 0
          ? setReportingSystems(responseData.reportingSystems)
          : null
      );
  }, []);

  return (
    <StyledRootGrid container component="main">
      <StyledImageGrid size={{ xs: false, sm: 4, md: 7 }} />
      <StyledPaper elevation={6} size={{ xs: 12, sm: 8, md: 5 }}>
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
                      <StyledEyeIcon onClick={() => setPasswordIsMasked(!passwordIsMasked)} />
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
              <Grid container hidden={disallowForgottenPasswordReset}>
                <Grid size="grow">
                  <Link href="#" variant="body2" onClick={toForgotPassword}>
                    Forgot password?
                  </Link>
                </Grid>
              </Grid>
            </StyledForm>
          </CardContent>
        </Card>
        {reportingSystems && <ShowReport reportingSystems={reportingSystems} />}
      </StyledPaper>
    </StyledRootGrid>
  );
}

const ShowReport = ({ reportingSystems }) => (
  <StyledReportGrid>
    <CardHeader title="View Reports" />
    <CardContent>
      <StyledReportTypography>
        Avni provides reports using one of two different external BI tools - Metabase and Jasper Reports. You can find out the reports used
        by your organisation from your system administrator.
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
  </StyledReportGrid>
);

const ReportDetails = ({ name, url }) => (
  <Link href={url}>
    <StyledReportButton size="small" variant="contained">
      {name}
    </StyledReportButton>
  </Link>
);

export default SignInView;
