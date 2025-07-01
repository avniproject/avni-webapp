import React from "react";
import { makeStyles } from "@mui/styles";
import { Paper, Button, GridLegacy as Grid, List, ListItem, ListItemText } from "@mui/material";
import moment from "moment/moment";
import { defaultTo, isEmpty, isEqual } from "lodash";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { InternalLink } from "../../../../common/components/utils";
import { selectFormMappingForCancelEncounter, selectFormMappingForEncounter } from "../../../sagas/encounterSelector";
import clsx from "clsx";
import { voidGeneralEncounter } from "../../../reducers/subjectDashboardReducer";
import ConfirmDialog from "../../../components/ConfirmDialog";
import { DeleteButton } from "../../../components/DeleteButton";

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
  cancelLabel: {
    color: "gray",
    backgroundColor: "#DCDCDC"
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

const CompletedEncounter = ({
  index,
  encounter,
  subjectTypeUuid,
  encounterFormMapping,
  cancelEncounterFormMapping,
  voidGeneralEncounter
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const encounterId = isEmpty(encounter.earliestVisitDateTime)
    ? encounter.encounterType.name.replaceAll(" ", "-")
    : encounter.name.replaceAll(" ", "-");
  const statusMap = {
    cancelled: t("Cancelled")
  };
  let status;
  let visitUrl;
  if (encounter.cancelDateTime) {
    status = "cancelled";
  } else {
    visitUrl = `/app/subject/viewEncounter?uuid=${encounter.uuid}`;
  }
  const [voidConfirmation, setVoidConfirmation] = React.useState(false);
  return (
    <Grid key={index} item xs={6} sm={3} className={classes.rightBorder}>
      <Paper className={classes.paper}>
        <List style={{ paddingBottom: "0px" }}>
          <ListItem className={classes.listItem}>
            {visitUrl ? (
              <Link to={visitUrl}>
                <ListItemText
                  className={classes.ListItemText}
                  title={t(defaultTo(encounter.name, encounter.encounterType.name))}
                  primary={truncate(t(defaultTo(encounter.name, encounter.encounterType.name)))}
                />
              </Link>
            ) : (
              <ListItemText
                className={classes.ListItemText}
                title={t(defaultTo(encounter.name, encounter.encounterType.name))}
                primary={truncate(t(defaultTo(encounter.name, encounter.encounterType.name)))}
              />
            )}
          </ListItem>
          <ListItem className={classes.listItem}>
            <ListItemText
              className={classes.listItemTextDate}
              primary={moment(new Date(encounter.encounterDateTime || encounter.cancelDateTime)).format("DD-MM-YYYY")}
            />
          </ListItem>
          {status && (
            <ListItem className={classes.listItem}>
              <ListItemText>
                <label
                  className={clsx(classes.programStatusStyle, {
                    [classes.cancelLabel]: isEqual(status, "cancelled")
                  })}
                >
                  {statusMap[status]}
                </label>
              </ListItemText>
            </ListItem>
          )}
        </List>
        {
          <>
            {encounter.encounterDateTime && encounter.uuid && !isEmpty(encounterFormMapping) ? (
              <InternalLink id={`edit-visit-${encounterId}`} to={`/app/subject/editEncounter?uuid=${encounter.uuid}`}>
                <Button color="primary" className={classes.visitButton}>
                  {t("edit visit")}
                </Button>
              </InternalLink>
            ) : encounter.cancelDateTime && encounter.uuid && !isEmpty(cancelEncounterFormMapping) ? (
              <InternalLink id={`edit-cancel-visit-${encounterId}`} to={`/app/subject/editCancelEncounter?uuid=${encounter.uuid}`}>
                <Button color="primary" className={classes.visitButton}>
                  {t("edit visit")}
                </Button>
              </InternalLink>
            ) : (
              ""
            )}
          </>
        }
        <DeleteButton onDelete={() => setVoidConfirmation(true)} />
        <ConfirmDialog
          title={t("GeneralEncounterVoidAlertTitle")}
          open={voidConfirmation}
          setOpen={setVoidConfirmation}
          message={t("GeneralEncounterVoidAlertMessage")}
          onConfirm={() => voidGeneralEncounter(encounter.uuid)}
        />
      </Paper>
    </Grid>
  );
};

const mapStateToProps = (state, props) => ({
  encounterFormMapping: selectFormMappingForEncounter(props.encounter.encounterType.uuid, props.subjectTypeUuid)(state),
  cancelEncounterFormMapping: selectFormMappingForCancelEncounter(props.encounter.encounterType.uuid, props.subjectTypeUuid)(state)
});

const mapDispatchToProps = {
  voidGeneralEncounter
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CompletedEncounter);
