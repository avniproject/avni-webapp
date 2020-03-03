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
    },
    marginTop: "15px"
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

const Visit = ({ name, visitDate, overdueDate, index, earliestVisitDate }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <Grid key={index} item xs={6} sm={3} className={classes.rightBorder}>
      <Paper className={classes.paper}>
        <List style={{ paddingBottom: "0px" }}>
          <ListItem className={classes.listItem}>
            <ListItemText
              className={classes.ListItemText}
              title={t(name)}
              primary={truncate(t(name))}
            />
          </ListItem>
          <ListItem className={classes.listItem}>
            <ListItemText
              className={classes.listItemTextDate}
              primary={moment(new Date(visitDate)).format("DD-MM-YYYY")}
            />
          </ListItem>
          {overdueDate && new Date() > new Date(overdueDate) ? (
            <ListItem className={classes.listItem}>
              <ListItemText>
                <label className={classes.programStatusStyle}>{t("Overdue")}</label>
              </ListItemText>
            </ListItem>
          ) : (
            ""
          )}

          {earliestVisitDate ? (
            <ListItem className={classes.listItem}>
              <label style={{ fontSize: "14px" }}>
                {`Scheduled on : ${moment(new Date(earliestVisitDate)).format("DD-MM-YYYY")}`}{" "}
              </label>
            </ListItem>
          ) : (
            ""
          )}
        </List>
        <div className={classes.visitButton}>
          <Button color="primary">{t("dovisit")}</Button>
          <Button color="primary">{t("cancelVisit")}</Button>
        </div>
      </Paper>
    </Grid>
  );
};

export default Visit;
