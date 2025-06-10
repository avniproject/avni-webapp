import React, { Fragment } from "react";
import { makeStyles } from "@mui/styles";
import { Paper, Typography, Grid } from "@mui/material";
import ProgramDetails from "./subjectDashboardProgramDetails";
import Program from "./Program";
import { useTranslation } from "react-i18next";
import SubjectVoided from "../../../components/SubjectVoided";

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  programBar: {
    height: "100px",
    backgroundColor: "#f9f9f9"
  },
  infomsg: {
    padding: 40
  }
}));

const SubjectDashboardProgramTab = ({ program, handleUpdateComponent, subjectTypeUuid, subjectVoided }) => {
  let flagActive = false;
  let flagExited = false;
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [selectedTabExited, setSelectedTabExited] = React.useState(false);
  const { t } = useTranslation();

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
        {subjectVoided && <SubjectVoided showUnVoid={false} />}
        <div className={classes.programBar}>
          <Grid container spacing={1}>
            {flagActive ? (
              <Fragment>
                <Program type="active" program={program} selectedTab={selectedTab} handleTabChange={handleTabChange} />
                <Grid item style={{ width: "60px" }} />
              </Fragment>
            ) : (
              ""
            )}

            {flagExited ? (
              <Program type="exited" program={program} selectedTab={selectedTabExited} handleTabChange={handleTabChangeExited} />
            ) : (
              ""
            )}

            {!(program && program.enrolments) && (
              <Typography component={"span"} gutterBottom className={classes.infomsg}>
                {" "}
                {t("notEnroledInAnyProgram")}{" "}
              </Typography>
            )}
          </Grid>
        </div>
        {selectedTab !== false ? (
          <ProgramDetails
            tabPanelValue={selectedTab}
            programData={program}
            handleUpdateComponent={handleUpdateComponent}
            subjectTypeUuid={subjectTypeUuid}
            subjectVoided={subjectVoided}
          />
        ) : (
          <ProgramDetails
            tabPanelValue={selectedTabExited}
            programData={program}
            handleUpdateComponent={handleUpdateComponent}
            subjectTypeUuid={subjectTypeUuid}
            subjectVoided={subjectVoided}
          />
        )}
      </Paper>
    </Fragment>
  );
};

export default SubjectDashboardProgramTab;
