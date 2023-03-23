import React from "react";
import { SignIn } from "aws-amplify-react";
import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  TextField
} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Link from "@material-ui/core/Link";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core/styles";
import SideImage from "avni-background.jpeg";
import AvniLogo from "avni-logo-black.png";
import InputAdornment from "@material-ui/core/InputAdornment";
import { RemoveRedEye } from "@material-ui/icons";
import Paper from "@material-ui/core/Paper";

class CustomSignIn extends SignIn {
  constructor(props) {
    super(props);
    this._validAuthStates = ["signIn", "signedOut", "signedUp"];

    this.state = {
      password: "",
      showPassword: false,
      passwordIsMasked: true
    };
  }

  showComponent(theme) {
    const { classes } = this.props;
    const { passwordIsMasked } = this.state;

    const togglePasswordMask = () => {
      this.setState({ passwordIsMasked: !this.state.passwordIsMasked });
    };
    return (
      <Grid container component="main" className={classes.root}>
        <Grid item xs={false} sm={4} md={7} className={classes.image} />
        <Grid
          item
          xs={12}
          sm={8}
          md={5}
          component={Paper}
          elevation={6}
          style={{ backgroundColor: "#f0f2f0" }}
        >
          <Box mb={4}>
            <img src={AvniLogo} alt="logo" height="45px" />
          </Box>
          <Card>
            <CardHeader title={"Sign in"} />
            <CardContent>
              <form className={classes.form} noValidate>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  key="username"
                  id="username"
                  label="Username"
                  name="username"
                  type="text"
                  onChange={this.handleInputChange}
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
                  onChange={this.handleInputChange}
                  id="password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <RemoveRedEye className={classes.eye} onClick={togglePasswordMask} />
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
                    super.signIn();
                  }}
                  disabled={this.state.loading}
                  classes={{ disabled: classes.disabledButton }}
                >
                  SIGN IN
                </Button>
                <Grid container>
                  <Grid item xs>
                    <Link
                      href="#"
                      variant="body2"
                      onClick={() => super.changeState("forgotPassword")}
                    >
                      Forgot password?
                    </Link>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
          <Grid style={{ backgroundColor: "#f0f2f0" }}>
            <CardHeader title={"View Reports"} />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Avni provides reports using one of two different external BI tools - Metabase and
                Jasper Reports. You can find out the reports used by your organisation from your
                system administrator.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <br />
                Choose your reporting system
              </Typography>
            </CardContent>
            <CardActions>
              <Link href={"https://reporting.avniproject.org"}>
                <Button size="small" variant={"contained"} className={classes.submit}>
                  Metabase Reports
                </Button>
              </Link>
              <Link
                href={"https://reporting-jasper.avniproject.org/jasperserver"}
                style={{ marginLeft: "56px" }}
              >
                <Button size="small" variant={"contained"} className={classes.submit}>
                  Jasper Reports
                </Button>
              </Link>
            </CardActions>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

const useStyles = theme => ({
  root: {
    height: "100vh"
  },
  image: {
    backgroundImage: `url(${SideImage})`,
    backgroundRepeat: "no-repeat",
    backgroundColor:
      theme.palette.type === "light" ? theme.palette.grey[50] : theme.palette.grey[900],
    backgroundSize: "cover",
    backgroundPosition: "center"
  },
  form: {
    width: "100%" // Fix IE 11 issue.
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

export default withStyles(useStyles)(CustomSignIn);
