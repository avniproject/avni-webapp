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
import { withStyles } from "@mui/styles";
import AvniLogo from "../../avni-logo-black.png";
import { RemoveRedEye } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import SideImage from "../../avni-background.jpeg";
import ApplicationContext from "../../ApplicationContext";
import http from "common/utils/httpClient";
import { useAuthenticator } from "@aws-amplify/ui-react";

function SignInView({ classes, onSignIn, notifyInputChange, loading, disallowForgottenPasswordReset = false }) {
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
    <Grid container component="main" className={classes.root}>
      <Grid item xs={false} sm={4} md={7} className={classes.image} />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} style={{ backgroundColor: "#f0f2f0" }}>
        <Box sx={{ mb: 4 }}>
          <img src={AvniLogo} alt="logo" height="45px" />
        </Box>
        <Card>
          <CardHeader title={"Sign in"} />
          <CardContent>
            <form className={classes.form} noValidate>
              <TextField
                variant="outlined"
                inputProps={{
                  autoComplete: autoComplete,
                  form: { autoComplete: autoComplete }
                }}
                margin="normal"
                required
                fullWidth
                key="username"
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
                key="password"
                name="password"
                label="Password"
                type={passwordIsMasked ? "password" : "text"}
                onChange={notifyInputChange}
                id="password"
                autoComplete={autoComplete}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <RemoveRedEye className={classes.eye} onClick={() => setPasswordIsMasked(!passwordIsMasked)} />
                    </InputAdornment>
                  )
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                className={classes.submit}
                onClick={event => {
                  event.preventDefault();
                  onSignIn();
                }}
                disabled={loading}
                classes={{ disabled: classes.disabledButton }}
              >
                SIGN IN
              </Button>
              <Grid container hidden={disallowForgottenPasswordReset}>
                <Grid item xs>
                  <Link href="#" variant="body2" onClick={toForgotPassword}>
                    Forgot password?
                  </Link>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
        {reportingSystems && <ShowReport classes={classes} reportingSystems={reportingSystems} />}
      </Grid>
    </Grid>
  );
}

const ShowReport = ({ classes, reportingSystems }) => (
  <Grid style={{ backgroundColor: "#f0f2f0" }}>
    <CardHeader title={"View Reports"} />
    <CardContent>
      <Typography variant="body2" sx={{ color: theme => theme.palette.secondary.main }}>
        Avni provides reports using one of two different external BI tools - Metabase and Jasper Reports. You can find out the reports used
        by your organisation from your system administrator.
      </Typography>
      <Typography variant="body2" sx={{ color: theme => theme.palette.secondary.main }}>
        <br />
        Choose your reporting system
      </Typography>
    </CardContent>
    <CardActions style={{ justifyContent: "space-evenly" }}>
      {reportingSystems.map(({ name, url }) => (
        <ReportDetails key={name} name={name} url={url} classes={classes} />
      ))}
    </CardActions>
  </Grid>
);

const ReportDetails = ({ name, url, classes }) => (
  <Link href={url}>
    <Button size="small" variant="contained" className={classes.submit}>
      {name}
    </Button>
  </Link>
);

const useStyles = theme => ({
  root: {
    height: "100vh"
  },
  image: {
    backgroundImage: `url(${SideImage})`,
    backgroundRepeat: "no-repeat",
    backgroundColor: theme.palette.mode === "light" ? theme.palette.grey[50] : theme.palette.grey[900],
    backgroundSize: "cover",
    backgroundPosition: "center"
  },
  form: {
    width: "100%"
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    backgroundColor: "#f27510",
    color: "white",
    height: "56px",
    boxShadow: "none",
    "&:hover": {
      backgroundColor: "#f27510"
    }
  },
  eye: {
    cursor: "pointer"
  }
});

export default withStyles(useStyles)(SignInView);
