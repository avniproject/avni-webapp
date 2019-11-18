import React from "react";
import { AppBar } from "react-admin";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core/styles";
import HomeIcon from "@material-ui/icons/Home";
import IconButton from "@material-ui/core/IconButton";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";

const styles = {
  title: {
    flex: 1,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden"
  }
};

const AdminAppBar = withStyles(styles)(({ classes, ...props }) => (
  <AppBar {...props}>
    <Typography variant="title" color="inherit" className={classes.title} id="react-admin-title" />
    <div>
      <b>{props.organisation.name} </b> ({props.user.username})
    </div>
    <IconButton onClick={() => props.history.push("/")} aria-label="Home" color="inherit">
      <HomeIcon />
    </IconButton>
  </AppBar>
));

const mapStateToProps = state => ({
  organisation: state.app.organisation,
  user: state.app.user
});

export default withRouter(connect(mapStateToProps, null)(AdminAppBar));
