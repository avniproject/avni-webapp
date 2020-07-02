import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import { getEncounter, getProgramEncounter } from "../../../reducers/viewVisitReducer";
import { withRouter, useHistory } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";
import Typography from "@material-ui/core/Typography";
import { Grid, Chip, Box } from "@material-ui/core";
import Observations from "common/components/Observations";
import FindRelative from "../components/FindRelative";
import Button from "@material-ui/core/Button";
import { InternalLink, LineBreak, RelativeLink } from "../../../../common/components/utils";

import moment from "moment/moment";
import { useTranslation } from "react-i18next";
import CustomizedBackdrop from "../../../components/CustomizedBackdrop";
import { Cancel } from "@material-ui/icons";

const useStyles = makeStyles(theme => ({
  root: {
    // padding: theme.spacing(3, 2),
    margin: theme.spacing(1, 3),
    flexGrow: 1,
    boxShadow:
      "0px 0px 3px 0px rgba(0,0,0,0.4), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)"
  },
  innerPaper: {
    padding: theme.spacing(2, 2),
    margin: theme.spacing(1, 1),
    height: 500
    // flexGrow: 1,
    // boxShadow:
    //   "0px 0px 3px 0px rgba(0,0,0,0.4), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)"
  },
  mainHeading: {
    fontSize: "20px",
    fontWeight: "500",
    marginLeft: 10,
    marginBottom: 10
  },

  subHeading: {
    fontWeight: "bold",
    fontSize: "12px",
    padding: theme.spacing(0.6, 0.6),
    margin: theme.spacing(1, 1)
  },

  scheduleddateStyle: {
    marginBottom: 20,
    marginTop: 10
  },
  findButton: {
    marginLeft: "8px",
    color: "white",
    cursor: "pointer",
    height: 30,
    padding: "4px 25px",
    fontSize: 12,
    borderRadius: 50
  },
  visitButton: {
    marginLeft: "8px",
    fontSize: "14px"
  },
  cancelBtn: {
    color: "orange",
    width: 110,
    cursor: "pointer",
    height: 30,
    padding: "4px 25px",
    fontSize: 12,
    borderRadius: 50,
    borderColor: "orange"
  },
  addBtn: {
    color: "white",
    width: 110,
    cursor: "pointer",
    height: 30,
    padding: "4px 25px",
    fontSize: 12,
    borderRadius: 50,
    marginRight: 20
    // backgroundColor: "orange"
  },
  buttomboxstyle: {
    backgroundColor: "#f8f4f4",
    height: 80,
    width: "100%",
    padding: 25
  }
  // noUnderline: {
  //   "&:hover, &:focus": {
  //     textDecoration: "none"
  //   }
  // }
}));

const AddRelative = ({
  match,
  subjectTypes,
  getEncounter,
  getProgramEncounter,
  encounter,
  load
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();
  // const isViewEncounter = match.path === "/app/subject/viewEncounter";
  // let viewAllCompletedUrl;

  // if (encounter) {
  //   viewAllCompletedUrl = isViewEncounter
  //     ? `/app/subject/completedEncounters?uuid=${encounter.subjectUuid}`
  //     : `/app/subject/completedProgramEncounters?uuid=${encounter.enrolmentUuid}`;
  // }
  useEffect(() => {
    // isViewEncounter
    //   ? getEncounter(match.queryParams.uuid)
    //   : getProgramEncounter(match.queryParams.uuid);
  }, []);
  return (
    <Fragment>
      <Breadcrumbs path={match.path} />
      <Paper className={classes.root}>
        <div className={classes.innerPaper}>
          <Grid container direction="row" justify="space-between" alignItems="baseline">
            <Typography component={"span"} className={classes.mainHeading}>
              {/* {t("ViewVisit")}:  */}
              Add Relative
            </Typography>
          </Grid>
          <div className={classes.scheduleddateStyle}>
            <Typography component={"span"} className={classes.subHeading}>
              {/* {t("Completed")} */}
              Find Relative
            </Typography>
          </div>
          <div className={classes.scheduleddateStyle}>
            {/* <Button variant="contained" className={classes.findButton} color="primary">
              Find Relative
            </Button> */}
            <FindRelative subjectTypes={subjectTypes} />
          </div>
        </div>
        <Box
          className={classes.buttomboxstyle}
          display="flex"
          flexDirection={"row"}
          flexWrap="wrap"
          justifyContent="flex-start"
        >
          <Box>
            <Button variant="contained" className={classes.addBtn} color="primary">
              ADD
            </Button>
            <Button variant="outlined" className={classes.cancelBtn} onClick={history.goBack}>
              CANCEL
            </Button>
          </Box>
        </Box>
      </Paper>
    </Fragment>
  );
};

const mapStateToProps = state => ({
  // encounter: state.dataEntry.viewVisitReducer.encounter,
  subjectTypes: state.dataEntry.metadata.operationalModules.subjectTypes
  // load: state.dataEntry.loadReducer.load
});

const mapDispatchToProps = {
  // getEncounter,
  // getProgramEncounter
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(AddRelative)
  )
);
