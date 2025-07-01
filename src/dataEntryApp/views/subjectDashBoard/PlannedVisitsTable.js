import React, { useMemo, useState } from "react";
import { makeStyles } from "@mui/styles";
import { Button, GridLegacy as Grid, Typography } from "@mui/material";
import { MaterialReactTable } from "material-react-table";
import { useTranslation } from "react-i18next";
import { InternalLink } from "../../../common/components/utils";
import { DeleteButton } from "../../components/DeleteButton";
import moment from "moment";
import { size } from "lodash";
import { formatDate } from "../../../common/utils/General";

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
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState([{ id: "earliestVisitDateTime", desc: true }]);

  const getStatus = ({ maxVisitDateTime, earliestVisitDateTime }) => {
    if (moment().isAfter(moment(maxVisitDateTime))) {
      return t("overdue");
    }
    if (moment().isAfter(moment(earliestVisitDateTime))) {
      return t("due");
    }
    return "";
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: t("visitName")
      },
      {
        accessorKey: "earliestVisitDateTime",
        header: t("visitscheduledate"),
        Cell: ({ row }) => formatDate(row.original.earliestVisitDateTime)
      },
      {
        id: "status",
        header: t("status"),
        enableSorting: false,
        Cell: ({ row }) => <label className={classes.labelStyle}>{t(getStatus(row.original))}</label>
      },
      {
        id: "actions",
        header: t("actions"),
        enableSorting: false,
        Cell: ({ row }) => (
          <Grid
            container
            spacing={10}
            sx={{
              alignItems: "center",
              alignContent: "center"
            }}
          >
            <Grid item>
              <InternalLink to={`${doBaseUrl}=${row.original.uuid}`}>
                <Button id={`do-visit-${row.original.uuid}`} color="primary">
                  {t("do")}
                </Button>
              </InternalLink>
            </Grid>
            <Grid item>
              <InternalLink to={`${cancelBaseURL}=${row.original.uuid}`}>
                <Button id={`cancel-visit-${row.original.uuid}`} color="primary">
                  {t("cancelVisit")}
                </Button>
              </InternalLink>
            </Grid>
            <Grid item>
              <DeleteButton onDelete={() => onDelete(row.original)} />
            </Grid>
          </Grid>
        )
      }
    ],
    [t, classes, doBaseUrl, cancelBaseURL, onDelete]
  );
  const renderNoVisitMessage = () => (
    <Typography variant="caption" sx={{ mb: 1 }} className={classes.infoMsg}>
      {" "}
      {t("no")} {t("plannedVisits")}{" "}
    </Typography>
  );
  const renderTable = () => (
    <MaterialReactTable
      columns={columns}
      data={plannedVisits || []}
      manualPagination
      manualSorting
      onPaginationChange={setPagination}
      onSortingChange={setSorting}
      rowCount={size(plannedVisits)}
      state={{ pagination, sorting }}
      enableGlobalFilter={false}
      enableColumnFilters={false}
      enableTopToolbar={false}
      initialState={{
        sorting: [{ id: "earliestVisitDateTime", desc: true }]
      }}
      muiTableProps={{
        sx: {
          tableLayout: "auto"
        }
      }}
    />
  );
  return size(plannedVisits) === 0 ? renderNoVisitMessage() : renderTable();
};
export default PlannedVisitsTable;
