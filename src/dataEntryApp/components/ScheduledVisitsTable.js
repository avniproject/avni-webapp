import { styled } from "@mui/material/styles";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { format, isValid } from "date-fns";
import Colors from "../Colors";
import { useTranslation } from "react-i18next";

const StyledTable = styled(Table)({
  borderRadius: "3px",
  boxShadow: "0px 0px 1px",
  backgroundColor: Colors.HighlightBackgroundColor
});

const ScheduledVisitsTable = ({ visitSchedules }) => {
  const { t } = useTranslation();

  return (
    <StyledTable aria-label="caption table">
      <TableHead>
        <TableRow>
          <TableCell align="left">{t("visitName")}</TableCell>
          <TableCell align="left">{t("schedulingFor")}</TableCell>
          <TableCell align="left">{t("overdueBy")}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {visitSchedules.map(row => (
          <TableRow key={row.name}>
            <TableCell align="left" component="th" scope="row">
              {t(row.name)}
            </TableCell>
            <TableCell align="left">
              {row.earliestDate && isValid(new Date(row.earliestDate)) ? format(new Date(row.earliestDate), "dd-MM-yyyy") : "-"}
            </TableCell>
            <TableCell align="left">
              {row.maxDate && isValid(new Date(row.maxDate)) ? format(new Date(row.maxDate), "dd-MM-yyyy") : "-"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </StyledTable>
  );
};

export default ScheduledVisitsTable;
