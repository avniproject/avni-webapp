import React from "react";
import { Paper } from "@material-ui/core";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { first } from "lodash";
import { searchSubjects } from "../../reducers/searchReducer";
import RegistrationMenu from "./RegistrationMenu";
// import PrimaryButton from "../../components/PrimaryButton";
import { useTranslation } from "react-i18next";
import { store } from "../../../common/store/createStore";

// import { SubjectsTable } from "./SubjectSearchTable";
// import CustomizedBackdrop from "../../components/CustomizedBackdrop";
// import { addSearchResultFilters } from "../../reducers/searchFilterReducer";

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
  const { t } = useTranslation();
  // const [page, setPage] = React.useState(0);
  // const [rowsPerPage, setRowsPerPage] = React.useState(10);
  // const [searchvalue, setSearchvalue] = React.useState("");

  // const handleSubmit = event => {
  //   event.preventDefault();
  //   props.search({ page: page, query: searchvalue, size: rowsPerPage });
  // };
  // const resethandleSubmit = event => {
  //   event.preventDefault();
  //   setSearchvalue("");
  //   props.search({ page: 0, query: "", size: rowsPerPage });
  // };

  // const valueSubmit = e => {
  //   setSearchvalue(e.target.value);
  // };
  // const searchRequest = store.getState().dataEntry.searchFilterReducer.request;
  // // const searchRequest = {};
  // console.log("searchResultData", searchRequest);
  return (
    <Paper className={classes.searchBox}>
      <div className={classes.searchCreateToolbar}>
        <RegistrationMenu className={classes.createButtonHolder} />
      </div>
      <NewSubjectSearchTable searchRequest={searchRequest} />
    </Paper>
  );
};

const mapStateToProps = state => {
  return {
    user: state.app.user,
    subjects: state.dataEntry.search.subjects,
    searchParams: state.dataEntry.search.subjectSearchParams,
    subjectType: first(state.dataEntry.metadata.operationalModules.subjectTypes),
    searchRequest: state.dataEntry.searchFilterReducer.request
    // searchResultData: state.dataEntry.searchFilterReducer.selectedSearchResultFilters
  };
};

const mapDispatchToProps = {
  search: searchSubjects
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SubjectSearch)
);
