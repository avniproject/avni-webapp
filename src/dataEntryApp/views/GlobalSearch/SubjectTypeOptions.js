import React, { Fragment } from "react";
import { makeStyles } from "@mui/styles";
import { Grid, Button } from "@mui/material";
import SubjectTypeIcon from "../../components/SubjectTypeIcon";
import { sortBy } from "lodash";

const useStyles = makeStyles(theme => ({
  selectedButton: {
    margin: theme.spacing(1),
    color: theme.palette.getContrastText("rgba(0,108,235,0.85)"),
    background: "rgba(0,108,235,0.85)",
    "&:hover": {
      backgroundColor: "rgb(0,108,235)"
    }
  },
  unSelectedButton: {
    margin: theme.spacing(1),
    color: theme.palette.getContrastText("rgb(252,252,252)"),
    background: "rgb(252,252,252)",
    "&:hover": {
      backgroundColor: "rgb(0,108,235)"
    }
  }
}));

const SubjectTypeOptions = ({ t, operationalModules, onSubjectTypeChange, selectedSubjectTypeUUID }) => {
  const classes = useStyles();

  function getClassName(subjectType) {
    return selectedSubjectTypeUUID === subjectType.uuid ? classes.selectedButton : classes.unSelectedButton;
  }

  return (
    <Fragment>
      <Grid container direction={"row"} spacing={1} alignItems={"center"}>
        {operationalModules.subjectTypes
          ? sortBy(operationalModules.subjectTypes, ({ name }) => t(name)).map((subjectType, index) => (
              <Grid key={index} item>
                <Button
                  key={index}
                  variant="outlined"
                  onClick={() => onSubjectTypeChange(subjectType.uuid)}
                  className={getClassName(subjectType)}
                >
                  <Grid container direction={"row"} spacing={1} alignItems={"center"}>
                    <Grid item>
                      <SubjectTypeIcon size={25} subjectType={subjectType} />
                    </Grid>
                    <Grid item>{subjectType.name}</Grid>
                  </Grid>
                </Button>
              </Grid>
            ))
          : ""}
      </Grid>
    </Fragment>
  );
};

export default SubjectTypeOptions;
