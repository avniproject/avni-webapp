import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import { setViewVisit } from "../../../reducers/viewVisitReducer";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";

import { useTranslation } from "react-i18next";
//import BrowserStore from "../../../api/browserStore";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3, 2),
    margin: theme.spacing(1, 3),
    flexGrow: 1
  },
  mainHeading: {
    fontSize: "20px"
  }
}));

const CompletedVisit = ({ match, setCompletedVisit }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  useEffect(() => {}, []);

  return (
    <Fragment>
      <Breadcrumbs path={match.path} />
      <Paper className={classes.root}>Table</Paper>
    </Fragment>
  );
};

const mapStateToProps = state => ({
  viewVisit: state.dataEntry.viewVisit
});

const mapDispatchToProps = {
  setViewVisit
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(CompletedVisit)
  )
);
