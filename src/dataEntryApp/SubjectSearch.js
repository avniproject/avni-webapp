import React, { useEffect } from "react";
import Table from "@material-ui/core/Table";
import Grid from "@material-ui/core/Grid";
import { withRouter } from "react-router-dom";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import { connect } from "react-redux";
import AppBar from "./AppBar";
import { makeStyles } from "@material-ui/core/styles";
import { searchSubjects, setSubjectSearchParams } from "../rootApp/ducks";
import RegistrationMenu from "./RegistrationMenu";

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

const SubjectsTable = ({ subjects }) => {
  const classes = useStyle();

  return (
    <Table className={classes.table}>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell align="center">Gender</TableCell>
          <TableCell align="center">Date of birth(Age)</TableCell>
          <TableCell align="center">Location</TableCell>
          <TableCell align="center">Active programs</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {subjects.map((row, id) => (
          <TableRow key={id}>
            <TableCell component="th" scope="row">
              {row.firstName + " " + row.lastName}
            </TableCell>
            <TableCell align="center">{row.gender.name}</TableCell>
            <TableCell align="center">{row.dateOfBirth}</TableCell>
            <TableCell align="center">
              {row.addressLevel.titleLineage}
            </TableCell>
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
    <div>
      <AppBar title="Search" />
      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justify="center"
      >
        <Grid item>
          <Paper className={classes.root}>
            <div className={classes.searchCreateToolbar}>
              <form onSubmit={handleSubmit} className={classes.searchForm}>
                <FormControl className={classes.searchFormItem}>
                  <InputLabel htmlFor="search-field">{""}</InputLabel>
                  <Input
                    id="search-field"
                    autoFocus
                    type="text"
                    value={props.searchParams.query}
                    onChange={e =>
                      props.setSearchParams({ query: e.target.value })
                    }
                  />
                </FormControl>
                <FormControl className={classes.searchFormItem}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="small"
                    color="primary"
                    onClick={handleSubmit}
                  >
                    Search
                  </Button>
                </FormControl>
              </form>
              <RegistrationMenu className={classes.createButtonHolder} />
            </div>
            <SubjectsTable subjects={props.subjects} />
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

const mapStateToProps = state => ({
  user: state.app.user,
  subjects: state.app.subjects,
  searchParams: state.app.subjectSearchParams
});

const mapDispatchToProps = dispatch => ({
  search: () => dispatch(searchSubjects()),
  setSearchParams: params => dispatch(setSubjectSearchParams(params))
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SubjectSearch)
);
