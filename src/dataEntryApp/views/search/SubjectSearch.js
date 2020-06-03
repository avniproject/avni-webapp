import React, { useEffect } from "react";
import { Table, TableRow, FormControl, InputLabel, Input, Button, Paper } from "@material-ui/core";
import { withRouter, Link } from "react-router-dom";
import { connect } from "react-redux";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { first } from "lodash";
import { searchSubjects } from "../../reducers/searchReducer";
import RegistrationMenu from "./RegistrationMenu";
import PrimaryButton from "../../components/PrimaryButton";
import { useTranslation } from "react-i18next";
import { ToolTipContainer } from "../../components/ToolTipContainer";
import { SubjectsTable } from "./SubjectSearchTable";
import CustomizedBackdrop from "../../components/CustomizedBackdrop";

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

const SubjectSearch = props => {
  const classes = useStyle();
  const { t } = useTranslation();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchvalue, setSearchvalue] = React.useState("");

  const handleSubmit = event => {
    event.preventDefault();
    props.search({ page: page, query: searchvalue, size: rowsPerPage });
  };
  const resethandleSubmit = event => {
    event.preventDefault();
    setSearchvalue("");
    props.search({ page: 0, query: "", size: rowsPerPage });
  };

  const valueSubmit = e => {
    setSearchvalue(e.target.value);
  };

  useEffect(() => {
    props.search();
    sessionStorage.clear("subject");
  }, []);

  return (
    <Paper className={classes.searchBox}>
      <div className={classes.searchCreateToolbar}>
        <CustomizedBackdrop load={props.load} />
        <form onSubmit={handleSubmit} className={classes.searchForm}>
          <FormControl className={classes.searchFormItem}>
            <InputLabel htmlFor="search-field">{""}</InputLabel>
            <Input
              id="search-field"
              autoFocus
              type="text"
              value={searchvalue}
              onChange={valueSubmit}
            />
          </FormControl>
          <FormControl className={classes.searchFormItem}>
            {/* <ToolTipContainer toolTipKey={t("searchHelpText")}> */}
            <PrimaryButton
              type={"submit"}
              onClick={handleSubmit}
              className={classes.searchBtnShadow}
            >
              {t("search")}
            </PrimaryButton>
            {/* </ToolTipContainer> */}
          </FormControl>
          <FormControl className={classes.searchFormItem}>
            <PrimaryButton
              variant="contained"
              color="secondary"
              onClick={resethandleSubmit}
              className={classes.resetBtnShadow}
            >
              {t("Reset")}
            </PrimaryButton>
          </FormControl>
        </form>
        <RegistrationMenu className={classes.createButtonHolder} />
      </div>
      <SubjectsTable
        subjects={props.subjects.content}
        type={props.subjectType}
        pageDetails={props}
        searchparam={searchvalue}
        rowsPerPage={rowsPerPage}
        setRowsPerPage={setRowsPerPage}
        page={page}
        setPage={setPage}
      />
    </Paper>
  );
};

const mapStateToProps = state => {
  return {
    user: state.app.user,
    subjects: state.dataEntry.search.subjects,
    searchParams: state.dataEntry.search.subjectSearchParams,
    subjectType: first(state.dataEntry.metadata.operationalModules.subjectTypes),
    load: state.dataEntry.loadReducer.load
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
