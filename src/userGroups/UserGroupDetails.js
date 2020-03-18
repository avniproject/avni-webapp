import { connect } from "react-redux";
import React from "react";
import { makeStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import { withRouter } from "react-router-dom";
import { getGroupDetails } from "./reducers";
import { TabbedView } from "./components/TabbedView";

const useStyles = makeStyles(theme => ({
  root: {},
  paper: {
    position: "absolute",
    width: 400,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3)
  }
}));

const UserGroupDetails = ({ getGroupDetails, groupDetails, ...props }) => {
  const classes = useStyles();
  React.useEffect(() => {
    getGroupDetails(props.match.params.id);
  }, []);

  return (
    <Grid container>
      Tabbed View comes here
      {/* <TabbedView></TabbedView> */}
    </Grid>
  );
};

const mapStateToProps = state => ({
  groupDetails: state.groupDetails
});

export default withRouter(
  connect(
    mapStateToProps,
    { getGroupDetails }
  )(UserGroupDetails)
);
