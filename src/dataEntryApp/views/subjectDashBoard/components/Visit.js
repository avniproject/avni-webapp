import React from "react";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import { Paper } from "@material-ui/core";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import moment from "moment/moment";
import Button from "@material-ui/core/Button";
import { useTranslation } from "react-i18next";
import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { InternalLink } from "../../../../common/components/utils";
import { isEmpty } from "lodash";
import {
  selectFormMappingForCancelProgramEncounter,
  selectFormMappingForProgramEncounter
} from "../../../sagas/programEncounterSelector";

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(2)
  },
  paper: {
    textAlign: "left",
    boxShadow: "none",
    borderRadius: "0px",
    // borderRight: "1px solid #dcdcdc",
    padding: "0px"
  },

  rightBorder: {
    borderRight: "1px solid rgba(0,0,0,0.12)",
    "&:nth-child(4n),&:last-child": {
      borderRight: "0px solid rgba(0,0,0,0.12)"
    }
  },
  programStatusStyle: {
    color: "red",
    backgroundColor: "#ffeaea",
    fontSize: "12px",
    padding: "2px 5px"
  },
  cancelLabel: {
    color: "gray",
    backgroundColor: "#DCDCDC",
    fontSize: "12px",
    padding: "2px 5px"
  },
  listItem: {
    paddingBottom: "0px",
    paddingTop: "0px"
  },
  ListItemText: {
    "& span": {
      fontSize: "14px"
    },
    color: "#2196f3",
    fontSize: "14px",
    textTransform: "uppercase"
  },
  listItemTextDate: {
    "& span": {
      fontSize: "15px",
      color: "#555555"
    }
  },
  visitButton: {
    marginLeft: "8px",
    fontSize: "14px"
  }
}));

const truncate = input => {
  if (input && input.length > 20) return input.substring(0, 20) + "...";
  else return input;
};

const Visit = ({
  name,
  visitDate,
  overdueDate,
  index,
  earliestVisitDate,
  encounterDateTime,
  uuid,
  enrolUuid,
  encounterTypeUuid,
  cancelDateTime,
  enableReadOnly,
  type,
  programUuid,
  subjectTypeUuid,
  programEncounterFormMapping,
  cancelProgramEncounterFormMapping
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  let visitUrl;
  switch (type) {
    case "programEncounter":
      visitUrl = `/app/subject/viewProgramEncounter?uuid=${uuid}`;
      break;
    case "encounter":
      visitUrl = `/app/subject/viewEncounter?uuid=${uuid}`;
      break;
    default:
      throw new Error("Invalid type. Must be programEncounter or encounter.");
  }

  return (
    <Grid key={index} item xs={6} sm={3} className={classes.rightBorder}>
      <Paper className={classes.paper}>
        <List style={{ paddingBottom: "0px" }}>
          <ListItem className={classes.listItem}>
            {visitDate !== null ? (
              <Link to={visitUrl}>
                <ListItemText
                  className={classes.ListItemText}
                  title={t(name)}
                  primary={truncate(t(name))}
                />
              </Link>
            ) : (
              <ListItemText
                className={classes.ListItemText}
                title={t(name)}
                primary={truncate(t(name))}
              />
            )}
          </ListItem>
          <ListItem className={classes.listItem}>
            {visitDate !== null ? (
              <ListItemText
                className={classes.listItemTextDate}
                primary={moment(new Date(visitDate)).format("DD-MM-YYYY")}
              />
            ) : (
              <ListItemText
                className={classes.listItemTextDate}
                primary={moment(new Date(earliestVisitDate)).format("DD-MM-YYYY")}
              />
            )}
          </ListItem>
          {cancelDateTime ? (
            <ListItem className={classes.listItem}>
              <ListItemText>
                <label className={classes.cancelLabel}>{t("Cancelled")}</label>
              </ListItemText>
            </ListItem>
          ) : overdueDate && new Date() > new Date(overdueDate) ? (
            <ListItem className={classes.listItem}>
              <ListItemText>
                <label className={classes.programStatusStyle}>{t("Overdue")}</label>
              </ListItemText>
            </ListItem>
          ) : (
            ""
          )}

          {/* {earliestVisitDate ? (
            <ListItem className={classes.listItem}>
              <label style={{ fontSize: "14px" }}>
                {`Scheduled on : ${moment(new Date(earliestVisitDate)).format("DD-MM-YYYY")}`}{" "}
              </label>
            </ListItem>
          ) : (
            ""
          )}  */}
        </List>
        {!enableReadOnly ? (
          <>
            {encounterDateTime && uuid && !isEmpty(programEncounterFormMapping) ? (
              <InternalLink to={`/app/subject/editProgramEncounter?uuid=${uuid}`}>
                <Button color="primary" className={classes.visitButton}>
                  {t("edit visit")}
                </Button>
              </InternalLink>
            ) : cancelDateTime && uuid && !isEmpty(cancelProgramEncounterFormMapping) ? (
              <InternalLink to={`/app/subject/editCancelProgramEncounter?uuid=${uuid}`}>
                <Button color="primary" className={classes.visitButton}>
                  {t("edit visit")}
                </Button>
              </InternalLink>
            ) : (
              <>
                {uuid && !isEmpty(programEncounterFormMapping) ? (
                  <InternalLink to={`/app/subject/programEncounter?encounterUuid=${uuid}`}>
                    <Button color="primary" className={classes.visitButton}>
                      {t("do visit")}
                    </Button>
                  </InternalLink>
                ) : (
                  ""
                )}
                {uuid && !isEmpty(cancelProgramEncounterFormMapping) ? (
                  <InternalLink to={`/app/subject/cancelProgramEncounter?uuid=${uuid}`}>
                    <Button color="primary" className={classes.visitButton}>
                      {t("cancel Visit")}
                    </Button>
                  </InternalLink>
                ) : (
                  ""
                )}
              </>
            )}
          </>
        ) : (
          ""
        )}
      </Paper>
    </Grid>
  );
};

const mapStateToProps = (state, props) => ({
  programEncounterFormMapping: selectFormMappingForProgramEncounter(
    props.encounterTypeUuid,
    props.programUuid,
    props.subjectTypeUuid
  )(state),
  cancelProgramEncounterFormMapping: selectFormMappingForCancelProgramEncounter(
    props.encounterTypeUuid,
    props.programUuid,
    props.subjectTypeUuid
  )(state)
});

export default withRouter(connect(mapStateToProps)(Visit));
