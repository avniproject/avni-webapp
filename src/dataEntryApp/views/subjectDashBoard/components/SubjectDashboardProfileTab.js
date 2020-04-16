import React, { Fragment } from "react";
import { makeStyles } from "@material-ui/core/styles";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import { bold } from "ansi-colors";
import moment from "moment/moment";
import Observations from "../../../../common/components/Observations";
import GridCommonList from "../components/GridCommonList";
import { Paper } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { InternalLink } from "../../../../common/components/utils";
import { setSubjectProfile, getSubjectProfile } from "../../../reducers/subjectDashboardReducer";
import { setSubject } from "../../../reducers/registrationReducer";
import { mapProfile } from "../../../../common/subjectModelMapper";
import { store } from "../../../../common/store//createStore";
import { types } from "../../../../common/store/conceptReducer";
import Link from "@material-ui/core/Link";

const useStyles = makeStyles(theme => ({
  expansionHeading: {
    fontSize: theme.typography.pxToRem(16),
    flexBasis: "33.33%",
    flexShrink: 0
  },
  expansionSecondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary
  },
  root: {
    flexGrow: 1,
    padding: theme.spacing(2)
  },
  listItemView: {
    border: "1px solid lightGrey"
  },
  expansionPanel: {
    marginBottom: "11px"
  },
  card: {
    boxShadow: "0px 0px 0px 0px rgba(0,0,0,0.12)",
    borderRight: "1px solid rgba(0,0,0,0.12)",
    borderRadius: "0"
  },
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)"
  },
  title: {
    fontSize: 14
  },
  headingBold: {
    fontWeight: bold
  },
  gridBottomBorder: {
    borderBottom: "1px solid rgba(0,0,0,0.12)",
    paddingBottom: "10px"
  }
}));

const SubjectDashboardProfileTab = ({ profile, path }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [expanded, setExpanded] = React.useState("");

  const handleChange = panel => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };
  const handleClick = () => {
    // const data =  getSubjectProfile(profile.uuid);
    // console.log("Profile data------------->",data);

    // var sdata = {"fullName":"1234 654","programEnrolments":[],"addressLevel":{"titleLineage":"Gandhi Nagar","title":"Gandhi Nagar","uuid":"fd1125be-8e1b-4f9a-ac16-caa1a6bc6a02","parentLocation":null,"id":8949},"gender":{"uuid":"5805fd83-636d-46ad-8926-f50a163344bd","name":"Male","id":30},"firstName":"1234","lastName":"654","dateOfBirth":"1997-04-10","registrationDate":"2020-04-10","registrationLocation":null,"uuid":"6f7c5872-135c-4f35-a80b-373681af5879","encounters":[],"facility":null,"observations":{"69e0acd4-e50f-4fe3-94aa-3e87c09aa116":9087654321,"a5b830e8-4a24-4e8c-bbaa-83421e32da95":"d69f8ff6-858c-4c2b-aba5-bf1c0fbaeef2","1e9815ef-8567-40c4-a1c3-a4b7495820e0":["df9bafd5-aae7-40f9-85c6-449d46364486","11f13a39-0f3e-48a1-9983-8a92d42029e9"],"5a7ecfaf-3f46-4966-8a4c-72d092df132a":12346,"fed0e423-de7e-490a-a1be-ad1267c83b63":"aaaaa1234","6975ef37-46e1-4669-bcde-008d04c6f7cb":"706c82b6-17ae-4ce7-9c15-891b76f2c389","355ef64b-7972-4572-9299-7ed1a1dc814f":"asdddd1233","95e333fd-577d-44ad-a97a-d2faa7a2f05c":"400e0767-4a95-4946-8045-9d75c9626cf4"},"activePrograms":[],"subjectType":{"operationalSubjectTypeName":"Individual","uuid":"43d0800a-4f62-415b-920f-06c41432f73a","name":"Individual","id":18},"id":1656};
    //  // setSubjectProfile(profile);
    //setSubjectProfile(mapProfile(profile))
    console.log("Profile---------------->", profile);
    //console.log("setSubject------------->",setSubject(profile));
    //sessionStorage.setItem("subject", JSON.stringify(sdata));
    //sessionStorage.setItem("subject", JSON.stringify(profile));
    // store.dispatch({ type: types.ADD_CONCEPT, value: profile.observations});
    //console.log("profile-abs",setSubjectProfile(mapProfile(profile)));

    //setSubject(profile)
    //sessionStorage.setItem("subject", JSON.stringify(setSubject(profile)));
  };

  //console.log("Profile--data",profile);

  return (
    <Fragment>
      <Paper className={classes.root}>
        <ExpansionPanel
          className={classes.expansionPanel}
          expanded={expanded === "registrationPanel"}
          onChange={handleChange("registrationPanel")}
        >
          <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="registrationPanelbh-content"
            id="registrationPanelbh-header"
          >
            <div>
              <h5>
                {t("registration")} {t("details")}
              </h5>
              <p>
                {t("registrationDate")}:{" "}
                {moment(new Date(profile.registrationDate)).format("DD-MM-YYYY")}
              </p>
            </div>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Grid item xs={12}>
              <List>
                <Observations observations={profile ? profile.observations : ""} />
              </List>
              <Button color="primary">{t("void")}</Button>
              {/* <Button color="primary">{t("edit")}</Button> */}
              <Button color="primary" onClick={handleClick}>
                <InternalLink to={`/app/editSubject?uuid=${profile.uuid}`}>
                  {t("edit")}{" "}
                </InternalLink>
              </Button>
            </Grid>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel
          className={classes.expansionPanel}
          expanded={expanded === "relativesPanel"}
          onChange={handleChange("relativesPanel")}
        >
          <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="relativesPanelbh-content"
            id="relativesPanelbh-header"
          >
            <Typography component={"span"} className={classes.expansionHeading}>
              {t("Relatives")}
            </Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails style={{ paddingTop: "0px" }}>
            <GridCommonList gridListDetails={profile.relationships} path={path} />
          </ExpansionPanelDetails>
          <Button color="primary"> {t("addARelative")}</Button>
        </ExpansionPanel>
      </Paper>
    </Fragment>
  );
};

export default SubjectDashboardProfileTab;
