import { Fragment } from "react";
import { styled } from "@mui/material/styles";
import { Table, TableBody, TableHead, TableCell, TableRow, Typography, Paper } from "@mui/material";
import { useTranslation } from "react-i18next";
import { isEqual, isNil } from "lodash";
import { LineBreak, InternalLink } from "../../../../common/components/utils";
import { ModelGeneral as General } from "avni-models";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3, 2),
  margin: theme.spacing(1, 3),
  flexGrow: 1
}));

const StyledTableCellHeader = styled(TableCell)({
  color: "black"
});

const StyledTableCell = styled(TableCell)({
  color: "#555555"
});

const NewVisitMenuView = ({ sections, uuid, isForProgramEncounters }) => {
  const { t } = useTranslation();
  const scheduledVisitUrl = isForProgramEncounters ? `/app/subject/programEncounter` : `/app/subject/encounter`;
  const actualVisitUrl = isForProgramEncounters
    ? `/app/subject/programEncounter?enrolUuid=${uuid}`
    : `/app/subject/encounter?subjectUuid=${uuid}`;

  return sections
    ? sections.map((section, index) => (
        <Fragment key={index}>
          <StyledPaper>
            <Typography sx={{ mb: 1 }}>{section.title}</Typography>
            <Paper>
              <Table size="small" aria-label="a dense table">
                <TableHead>
                  <TableRow>
                    <StyledTableCellHeader>{t("name")}</StyledTableCellHeader>
                    {isEqual(section.title, t("plannedVisits")) ? (
                      <StyledTableCellHeader>{t("Date")}</StyledTableCellHeader>
                    ) : (
                      <TableCell />
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {section.data
                    .filter(e => !isNil(e.encounterType))
                    .map(encounter => (
                      <TableRow key={encounter.uuid}>
                        {encounter.encounterType ? (
                          <StyledTableCell component="th" scope="row" width="50%">
                            <InternalLink
                              id={encounter.name.replaceAll(" ", "-")}
                              to={
                                isEqual(section.title, t("plannedVisits"))
                                  ? `${scheduledVisitUrl}?encounterUuid=${encounter.uuid}`
                                  : `${actualVisitUrl}&uuid=${encounter.encounterType.uuid}`
                              }
                            >
                              {t(encounter.name)}
                            </InternalLink>
                          </StyledTableCell>
                        ) : (
                          ""
                        )}
                        <TableCell align="left" width="50%">
                          {encounter.earliestVisitDateTime && General.toDisplayDate(encounter.earliestVisitDateTime)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Paper>
          </StyledPaper>
          <LineBreak num={1} />
        </Fragment>
      ))
    : "";
};

export default NewVisitMenuView;
