import React from "react";
import { Paper } from "@material-ui/core";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import RegistrationMenu from "./RegistrationMenu";
import NewSubjectSearchTable from "dataEntryApp/views/search/NewSubjectSearchTable";

const useStyle = makeStyles(theme => ({
  root: {
    width: "100%",
    marginTop: theme.spacing(3),
    overflowX: "auto",
    flexShrink: 0,
    marginLeft: theme.spacing(2.5)
  },
  searchCreateToolbar: {
    display: "flex"
  },
  searchForm: {
    marginLeft: theme.spacing(3),
    marginBottom: theme.spacing(8),
    display: "flex",
    alignItems: "flex-end",
    flex: 8
  },
  searchFormItem: {
    margin: theme.spacing(1)
  },
  searchBtnShadow: {
    boxShadow: "none",
    backgroundColor: "#0e6eff",
    marginRight: 10
  },
  resetBtnShadow: {
    boxShadow: "none",
    backgroundColor: "#FF8C00",
    marginRight: 10
  },
  createButtonHolder: {
    flex: 1
  },
  searchBox: {
    padding: "1.5rem",
    margin: "2rem 1rem"
  }
}));

const SubjectSearch = ({ searchRequest }) => {
  const classes = useStyle();

  return (
    <Paper className={classes.searchBox}>
      {/* <div className={classes.searchCreateToolbar}>
        <RegistrationMenu className={classes.createButtonHolder} />
      </div> */}

      <NewSubjectSearchTable searchRequest={searchRequest} />
    </Paper>
  );
};

const mapStateToProps = state => {
  return {
    searchRequest: state.dataEntry.searchFilterReducer.request
  };
};

const mapDispatchToProps = {};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SubjectSearch)
);
