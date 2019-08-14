import React, { useEffect } from "react";
import Table from "@material-ui/core/Table";
import { withRouter } from "react-router-dom";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import Button from "@material-ui/core/Button";
import { connect } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { first } from "lodash";
import { setSubjectSearchParams, searchSubjects } from "../../reducers/searchReducer";
import RegistrationMenu from "./RegistrationMenu";
import ScreenWithAppBar from "../../../common/components/ScreenWithAppBar";
import PrimaryButton from "../../components/PrimaryButton";

const useStyle = makeStyles(theme => ({
  root: {
    width: "100%",
    marginTop: theme.spacing(3),
    overflowX: "auto"
  },
  table: {
    minWidth: 1000
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
  createButtonHolder: {
    flex: 1
  }
}));

const SubjectsTable = ({ type, subjects }) => {
  const classes = useStyle();

  return (
    <Table className={classes.table}>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          {type.name === "Individual" && <TableCell align="center">Gender</TableCell>}
          {type.name === "Individual" && <TableCell align="center">Date of birth(Age)</TableCell>}
          <TableCell align="center">Location</TableCell>
          <TableCell align="center">Active programs</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {subjects.map((row, id) => (
          <TableRow key={id}>
            <TableCell component="th" scope="row">
              {row.fullName}
            </TableCell>
            {type.name === "Individual" && <TableCell align="center">{row.gender.name}</TableCell>}
            {type.name === "Individual" && <TableCell align="center">{row.dateOfBirth}</TableCell>}
            <TableCell align="center">{row.addressLevel.titleLineage}</TableCell>
            <TableCell align="center">
              {row.activePrograms.map((p, key) => (
                <Button
                  key={key}
                  size="small"
                  style={{
                    height: 20,
                    padding: 0,
                    backgroundColor: p.colour,
                    color: "white"
                  }}
                  disabled
                >
                  {p.operationalProgramName}
                </Button>
              ))}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const SubjectSearch = props => {
  const classes = useStyle();

  const handleSubmit = event => {
    event.preventDefault();
    props.search();
  };

  useEffect(() => {
    props.search();
  }, []);

  return (
    <ScreenWithAppBar appbarTitle={`Search ${props.subjectType.name}`}>
      <div className={classes.searchCreateToolbar}>
        <form onSubmit={handleSubmit} className={classes.searchForm}>
          <FormControl className={classes.searchFormItem}>
            <InputLabel htmlFor="search-field">{""}</InputLabel>
            <Input
              id="search-field"
              autoFocus
              type="text"
              value={props.searchParams.query}
              onChange={e => props.setSearchParams({ query: e.target.value })}
            />
          </FormControl>
          <FormControl className={classes.searchFormItem}>
            <PrimaryButton type={"submit"} onClick={handleSubmit}>
              Search
            </PrimaryButton>
          </FormControl>
        </form>
        <RegistrationMenu className={classes.createButtonHolder} />
      </div>
      <SubjectsTable subjects={props.subjects} type={props.subjectType} />
    </ScreenWithAppBar>
  );
};

const mapStateToProps = state => {
  return {
    user: state.app.user,
    subjects: state.dataEntry.search.subjects,
    searchParams: state.dataEntry.search.subjectSearchParams,
    subjectType: first(state.dataEntry.metadata.operationalModules.subjectTypes)
  };
};

const mapDispatchToProps = {
  search: searchSubjects,
  setSearchParams: setSubjectSearchParams
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SubjectSearch)
);
