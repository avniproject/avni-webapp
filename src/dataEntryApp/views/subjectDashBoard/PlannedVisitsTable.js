import React from "react";
import { Button, Grid, makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import MaterialTable from "material-table";
import { InternalLink } from "../../../common/components/utils";
import { DeleteButton } from "../../components/DeleteButton";
import moment from "moment";
import Typography from "@material-ui/core/Typography";
import { size } from "lodash";
import { formatDate } from "../../../common/utils/General";
import materialTableIcons from "../../../common/material-table/MaterialTableIcons";

const useStyles = makeStyles(theme => ({
  labelStyle: {
    color: "red",
    backgroundColor: "#ffeaea",
    fontSize: "12px",
    alignItems: "center",
    margin: 0
  },
  infoMsg: {
    marginLeft: 10
  }
}));

const PlannedVisitsTable = ({ plannedVisits, doBaseUrl, cancelBaseURL, onDelete }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const getStatus = ({ maxVisitDateTime, earliestVisitDateTime }) => {
    if (moment().isAfter(moment(maxVisitDateTime))) {
      return t("overdue");
    }
    if (moment().isAfter(moment(earliestVisitDateTime))) {
      return t("due");
    }
    return "";
  };

  const columns = [
    {
      title: t("visitName"),
      field: "name"
    },
    {
      title: t("visitscheduledate"),
      field: "earliestVisitDateTime",
      type: "date",
      render: row => formatDate(row.earliestVisitDateTime),
      defaultSort: "desc"
    },
    {
      title: t("status"),
      render: row => <label className={classes.labelStyle}>{t(getStatus(row))}</label>
    },
    {
      title: t("actions"),
      field: "actions",
      sorting: false,
      render: row => (
        <Grid container alignItems={"center"} alignContent={"center"} spacing={10}>
          <Grid item>
            <InternalLink to={`${doBaseUrl}=${row.uuid}`}>
              <Button id={`do-visit-${row.uuid}`} color="primary">
                {t("do")}
              </Button>
            </InternalLink>
          </Grid>
          <Grid item>
            <InternalLink to={`${cancelBaseURL}=${row.uuid}`}>
              <Button id={`cancel-visit-${row.uuid}`} color="primary">
                {t("cancelVisit")}
              </Button>
            </InternalLink>
          </Grid>
          <Grid item>
            <DeleteButton onDelete={() => onDelete(row)} />
          </Grid>
        </Grid>
      )
    }
  ];

  const renderNoVisitMessage = () => (
    <Typography variant="caption" gutterBottom className={classes.infoMsg}>
      {" "}
      {t("no")} {t("plannedVisits")}{" "}
    </Typography>
  );

  const renderTable = () => (
    <MaterialTable
      icons={materialTableIcons}
      title=""
      columns={columns}
      data={plannedVisits}
      options={{
        pageSize: 10,
        pageSizeOptions: [10, 15, 20],
        addRowPosition: "first",
        sorting: true,
        headerStyle: {
          zIndex: 1
        },
        debounceInterval: 500,
        search: false,
        toolbar: false
      }}
    />
  );

  return size(plannedVisits) === 0 ? renderNoVisitMessage() : renderTable();
};
export default PlannedVisitsTable;
