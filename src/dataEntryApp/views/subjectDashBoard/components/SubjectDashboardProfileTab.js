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
              <Button color="primary">{t("edit")}</Button>
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
