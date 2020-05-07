import React, { Fragment } from "react";
import { Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import ProgramDetails from "./subjectDashboardProgramDetails";
import Program from "./Program";

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  programBar: {
    height: "100px",
    backgroundColor: "#f9f9f9"
  }
}));

const SubjectDashboardProgramTab = ({ program }) => {
  let flagActive = false;
  let flagExited = false;
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [selectedTabExited, setSelectedTabExited] = React.useState(false);

  const handleTabChange = (event, newValue) => {
    setSelectedTabExited(false);
    setSelectedTab(newValue);
  };

  const handleTabChangeExited = (event, newValue) => {
    setSelectedTab(false);
    setSelectedTabExited(newValue);
  };

  if (program && program.enrolments) {
    program.enrolments.sort(function(left, right) {
      return left.programExitDateTime ? 1 : right.programExitDateTime ? -1 : 0;
    });
  }

  const classes = useStyles();

  function isActive(element) {
    return element.programExitDateTime == null;
  }

  function isExited(element) {
    return element.programExitDateTime != null;
  }

  if (program && program.enrolments) {
    flagActive = program && program.enrolments && program.enrolments.some(isActive);
    flagExited = program && program.enrolments && program.enrolments.some(isExited);
  }

  return (
    <Fragment>
      <Paper className={classes.root}>
        <div className={classes.programBar}>
          <Grid container spacing={1}>
            {flagActive ? (
              <Fragment>
                <Program
                  type="active"
                  program={program}
                  selectedTab={selectedTab}
                  handleTabChange={handleTabChange}
                />
                <Grid item style={{ width: "60px" }} />
              </Fragment>
            ) : (
              ""
            )}

            {flagExited ? (
              <Program
                type="exited"
                program={program}
                selectedTab={selectedTabExited}
                handleTabChange={handleTabChangeExited}
              />
            ) : (
              ""
            )}
          </Grid>
        </div>
        {selectedTab !== false ? (
          <ProgramDetails
            tabType={program.enrolments[0].programExitDateTime ? "ExitedProgram" : "ActiveProgram"}
            tabPanelValue={selectedTab}
            programData={program}
          />
        ) : (
          <ProgramDetails
            tabType={program.enrolments[0].programExitDateTime ? "ExitedProgram" : "ActiveProgram"}
            tabPanelValue={selectedTabExited}
            programData={program}
          />
        )}
      </Paper>
    </Fragment>
  );
};

export default SubjectDashboardProgramTab;
