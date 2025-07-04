import { styled } from "@mui/material/styles";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import moment from "moment";
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
            <TableCell align="left">{moment(row.earliestDate).format("DD-MM-YYYY")}</TableCell>
            <TableCell align="left">{moment(row.maxDate).format("DD-MM-YYYY")}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </StyledTable>
  );
};

export default ScheduledVisitsTable;
