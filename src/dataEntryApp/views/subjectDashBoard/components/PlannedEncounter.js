import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Paper, Button, Grid, List, ListItem, ListItemText } from "@material-ui/core";
import moment from "moment/moment";
import { InternalLink } from "../../../../common/components/utils";
import { find, isEmpty, isNil } from "lodash";
import { useTranslation } from "react-i18next";
import { connect } from "react-redux";
import { selectFormMappingForEncounter } from "../../../sagas/encounterSelector";

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

const PlannedEncounter = ({
  index,
  encounter,
  subjectUuid,
  enableReadOnly,
  subjectTypeUuid,
  encounterFormMapping
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const statusMap = {
    cancelled: t("Cancelled"),
    overdue: t("Overdue"),
    due: t("Due")
  };

  let status;
  if (encounter.cancelDateTime) {
    status = "cancelled";
  } else if (encounter.maxVisitDateTime && new Date() > encounter.maxVisitDateTime) {
    status = "overdue";
  } else if (encounter.earliestVisitDateTime && new Date() > encounter.earliestVisitDateTime) {
    status = "due";
  }

  return (
    <Grid key={index} item xs={6} sm={3} className={classes.rightBorder}>
      <Paper className={classes.paper}>
        <List style={{ paddingBottom: "0px" }}>
          <ListItem className={classes.listItem}>
            <ListItemText
              className={classes.ListItemText}
              title={t(encounter.encounterType.name)}
              primary={truncate(t(encounter.encounterType.name))}
            />
          </ListItem>
          <ListItem className={classes.listItem}>
            <ListItemText
              className={classes.listItemTextDate}
              primary={moment(new Date(encounter.earliestVisitDateTime)).format("DD-MM-YYYY")}
            />
          </ListItem>
          {status && (
            <ListItem className={classes.listItem}>
              <ListItemText>
                <label className={classes.programStatusStyle}>{statusMap[status]}</label>
              </ListItemText>
            </ListItem>
          )}
        </List>
        {!enableReadOnly ? (
          <>
            {encounter.cancelDateTime ? (
              <Button color="primary" className={classes.visitButton}>
                {t("edit visit")}
              </Button>
            ) : (
              <div className={classes.visitButton}>
                {encounter.uuid && !isEmpty(encounterFormMapping) ? (
                  <InternalLink to={`/app/subject/encounter?encounterUuid=${encounter.uuid}`}>
                    <Button color="primary">{t("do visit")}</Button>
                  </InternalLink>
                ) : (
                  ""
                )}
              </div>
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
  encounterFormMapping: selectFormMappingForEncounter(
    props.encounter.encounterType.uuid,
    props.subjectTypeUuid
  )(state)
});

export default connect(mapStateToProps)(PlannedEncounter);
