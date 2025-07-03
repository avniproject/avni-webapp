import React, { useMemo, useState } from "react";
import { styled } from '@mui/material/styles';
import { Button, Grid, Typography } from "@mui/material";
import { MaterialReactTable } from "material-react-table";
import { useTranslation } from "react-i18next";
import { InternalLink } from "../../../common/components/utils";
import { DeleteButton } from "../../components/DeleteButton";
import moment from "moment";
import { size } from "lodash";
import { formatDate } from "../../../common/utils/General";

const StyledLabel = styled('label')({
  color: "red",
  backgroundColor: "#ffeaea",
  fontSize: "12px",
  alignItems: "center",
  margin: 0
});

const StyledTypography = styled(Typography)(({ theme }) => ({
  marginLeft: theme.spacing(1.25)
}));

const StyledGrid = styled(Grid)(({ theme }) => ({
  container: true,
  spacing: theme.spacing(10),
  alignItems: "center",
  alignContent: "center"
}));

const StyledTable = styled(MaterialReactTable)({
  tableLayout: "auto"
});

const PlannedVisitsTable = ({ plannedVisits, doBaseUrl, cancelBaseURL, onDelete }) => {
  const { t } = useTranslation();
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
        Cell: ({ row }) => <StyledLabel>{t(getStatus(row.original))}</StyledLabel>
      },
      {
        id: "actions",
        header: t("actions"),
        enableSorting: false,
        Cell: ({ row }) => (
          <StyledGrid>
            <Grid>
              <InternalLink to={`${doBaseUrl}=${row.original.uuid}`}>
                <Button id={`do-visit-${row.original.uuid}`} color="primary">
                  {t("do")}
                </Button>
              </InternalLink>
            </Grid>
            <Grid>
              <InternalLink to={`${cancelBaseURL}=${row.original.uuid}`}>
                <Button id={`cancel-visit-${row.original.uuid}`} color="primary">
                  {t("cancelVisit")}
                </Button>
              </InternalLink>
            </Grid>
            <Grid>
              <DeleteButton onDelete={() => onDelete(row.original)} />
            </Grid>
          </StyledGrid>
        )
      }
    ],
    [t, doBaseUrl, cancelBaseURL, onDelete]
  );

  const renderNoVisitMessage = () => (
    <StyledTypography variant="caption">
      {" "}
      {t("no")} {t("plannedVisits")}{" "}
    </StyledTypography>
  );

  const renderTable = () => (
    <StyledTable
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
    />
  );

  return size(plannedVisits) === 0 ? renderNoVisitMessage() : renderTable();
};

export default PlannedVisitsTable;