import React from "react";
import { SignIn } from "aws-amplify-react";
import { Grid, TextField, Box, Hidden } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Link from "@material-ui/core/Link";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core/styles";
// import SideImage from "../../src/login_image.png";
import SideImage from "formDesigner/styles/images/background.jpg";
import AvniLogo from "formDesigner/styles/images/avniLogo.png";
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

    const handleMouseDownPassword = event => {
      event.preventDefault();
    };

    return (
      <Grid container component="main" className={classes.root}>
        <Grid item xs={false} sm={4} md={7} className={classes.image} />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6}>
          <Box mt={10} ml={4} display={"flex"} flexDirection={"column"} alignItems={"flex-start"}>
            <Box mb={4}>
              <img src={AvniLogo} alt="logo" height="45px" />
            </Box>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
          </Box>
          <Box display={"flex"} flexDirection={"column"} mb={8} ml={4} mr={4}>
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
          </Box>
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
    // backgroundImage: `url(${SideImage})`,
    // backgroundRepeat: "no-repeat",
    // backgroundSize: "auto",
    // backgroundPosition: "initial"
    backgroundImage: `url(${SideImage})`,
    backgroundRepeat: "no-repeat",
    backgroundColor:
      theme.palette.type === "light" ? theme.palette.grey[50] : theme.palette.grey[900],
    backgroundSize: "cover",
    backgroundPosition: "center"
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1)
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    backgroundColor: "#f27510",
    color: "white",
    borderRadius: 50,
    height: "38px",
    boxShadow: "none",
    "&:hover": {
      backgroundColor: "#f27510"
    }
  },
  eye: {
    cursor: "pointer"
  },
  disabledSubmit: {
    margin: theme.spacing(3, 0, 2),
    color: "white",
    borderRadius: 50,
    height: "38px",
    boxShadow: "none"
  }
});

export default withStyles(useStyles)(CustomSignIn);
