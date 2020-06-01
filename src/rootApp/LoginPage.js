import React, { Fragment } from "react";
import { SignIn } from "aws-amplify-react";
import { TextField, FormLabel, Paper, Grid } from "@material-ui/core";
import styles from "./LoginPage.css";
import Fab from "@material-ui/core/Fab";
import logo from "../../src/formDesigner/styles/images/avniLogo.png";

// import Visibility from '@material-ui/icons/Visibility';
// import VisibilityOff from '@material-ui/icons/VisibilityOff'
// import InputLabel from '@material-ui/core/InputLabel';
// import InputAdornment from '@material-ui/core/InputAdornment';
// import IconButton from '@material-ui/core/IconButton';
// import Input from '@material-ui/core/Input';

export class CustomSignIn extends SignIn {
  constructor(props) {
    super(props);
    this._validAuthStates = ["signIn", "signedOut", "signedUp"];

    // this.state = {
    //    amount: '',
    //    password: '',
    //    weight: '',
    //    weightRange: '',
    //    showPassword: false
    // };
  }

  showComponent(theme) {
    // const handleClickShowPassword = () => {
    //   this.setState({showPassword: !this.state.showPassword });
    // };

    // const handleMouseDownPassword = (event) => {
    //   event.preventDefault();
    // };

    return (
      <Fragment>
        <Grid>
          <div>
            <div>
              {/* <img
                src={require("../../src/logo.png")}
                id="img1"
                style={{ marginLeft: "20px", margin: "69px 95px", marginTop: "90px" }}
              /> */}
              <img
                src={logo}
                alt="logo"
                id="img1"
                style={{
                  marginLeft: "13%",
                  marginBottom: "5%",
                  marginTop: "9%",
                  height: "45px"
                }}
              />

              <img
                src={require("../../src/login_image.png")}
                id="img2"
                style={{ float: "right" }}
              />
              <div style={{ marginBottom: "1.5%" }}>
                <FormLabel
                  style={{
                    marginLeft: "13%",
                    fontSize: "23px",
                    color: "black",
                    FontWight: "350"
                  }}
                >
                  Sign In
                </FormLabel>
              </div>
            </div>
            <div className="mx-auto w-full max-w-xs">
              <ul style={{ marginLeft: "10%", listStyleType: "none" }}>
                <li>
                  <TextField
                    id="username"
                    key="username"
                    name="username"
                    onChange={this.handleInputChange}
                    type="text"
                    label="Username"
                    style={{ width: "25%", marginBottom: "2%" }}
                  />
                </li>
                <li>
                  <TextField
                    id="password"
                    key="password"
                    name="password"
                    onChange={this.handleInputChange}
                    type="password"
                    label="Password"
                    style={{ width: "25%", marginBottom: "1%" }}
                  />

                  {/* <InputLabel >Password</InputLabel>
                            <Input
                              id="password"
                              type={this.state.showPassword ? 'text' : 'password'}
                              value={this.state.password}
                              onChange={this.handleInputChange}
                              endAdornment={
                                <InputAdornment position="end">
                                  <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleClickShowPassword}
                                    onMouseDown={handleMouseDownPassword}
                                  >
                                    {this.state.showPassword ? <Visibility /> : <VisibilityOff />}
                                  </IconButton>
                                </InputAdornment>
                              }
                              style={{width:'249px'}}
                            />

 */}

                  <span>
                    <a
                      className="text-indigo cursor-pointer hover:text-indigo-darker"
                      onClick={() => super.changeState("forgotPassword")}
                    >
                      <p
                        className="text-grey-dark"
                        style={{
                          marginLeft: "16%",
                          cursor: "pointer",
                          color: "#0095ff",
                          fontSize: "12px"
                        }}
                      >
                        Forgot password?
                      </p>
                    </a>
                    {/* <a
                    className="text-indigo cursor-pointer hover:text-indigo-darker"
                    onClick={() => super.changeState("forgotPassword")}
                  >
                    Reset Password
                  </a> */}
                  </span>
                </li>
                <li>
                  <div className="flex items-center justify-between">
                    <Fab
                      style={{ backgroundColor: "#f27510", height: "38px", boxShadow: "none" }}
                      variant="extended"
                      color="primary"
                      onClick={() => super.signIn()}
                    >
                      Sign In
                    </Fab>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </Grid>
      </Fragment>
    );
  }
}
