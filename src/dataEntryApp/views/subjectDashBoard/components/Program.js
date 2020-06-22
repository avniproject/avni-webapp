import React from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Grid from "@material-ui/core/Grid";
import { useTranslation } from "react-i18next";
const AntTabs = withStyles({
  indicator: {
    display: "none"
  },
  root: {
    minHeight: "35px"
  }
})(Tabs);

const AntTab = withStyles(theme => ({
  root: {
    "&$selected": {
      backgroundColor: "#dae8fe",
      borderRight: "2px solid #1890ff",
      height: "35px"
    },
    color: "#2196f3",
    fontSize: "14px",
    minHeight: "35px",
    borderRight: "2px solid #1890ff",
    textTransform: "none"
  },
  selected: {}
}))(props => <Tab disableRipple {...props} />);
const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  activeProgramBar: {
    maxWidth: "600px",
    marginTop: "14px",
    marginLeft: "20px",
    height: "18px"
  },
  activeProgramLabel: {
    fontSize: "12px",
    color: "#555555",
    fontWeight: "500"
  },
  exitedProgramBar: {
    maxWidth: "372px",
    marginTop: "14px",
    marginLeft: "25px"
  },
  exitedProgramLabel: {
    fontSize: "12px",
    color: "#555555",
    fontWeight: "500"
  }
}));

const Program = ({ type, program, selectedTab, handleTabChange }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Grid item className={type === "active" ? classes.activeProgramBar : classes.exitedProgramBar}>
      <label
        className={type === "active" ? classes.activeProgramLabel : classes.exitedProgramLabel}
      >
        {t(type === "active" ? "activeprograms" : "exitedProgram")}
      </label>

      <AppBar
        style={type === "active" ? { minHeight: "35px" } : {}}
        position="static"
        color="default"
      >
        <AntTabs
          onChange={handleTabChange}
          value={selectedTab}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          aria-label="scrollable auto tabs example"
        >
          {program && program.enrolments
            ? program.enrolments.map((element, index) =>
                (element.programExitDateTime == null && type === "active") ||
                (element.programExitDateTime != null && type === "exited") ? (
                  <AntTab
                    key={index}
                    value={index}
                    label={t(element.program.operationalProgramName)}
                  />
                ) : (
                  ""
                )
              )
            : ""}
        </AntTabs>
      </AppBar>
    </Grid>
  );
};

export default Program;
