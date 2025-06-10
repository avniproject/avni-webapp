import React, { Fragment } from "react";
import { makeStyles } from "@mui/styles";
import { Table, TableBody, TableHead, TableCell, TableRow, Typography, Paper } from "@mui/material";
import { useTranslation } from "react-i18next";
import { isEqual, isNil } from "lodash";
import { LineBreak, InternalLink } from "../../../../common/components/utils";
import { ModelGeneral as General } from "avni-models";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3, 2),
    margin: theme.spacing(1, 3),
    flexGrow: 1
  },
  tableHeader: {
    color: "black"
  },
  tableCell: {
    color: "#555555"
  }
}));

const NewVisitMenuView = ({ sections, uuid, isForProgramEncounters }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const scheduledVisitUrl = isForProgramEncounters ? `/app/subject/programEncounter` : `/app/subject/encounter`;
  const actualVisitUrl = isForProgramEncounters
    ? `/app/subject/programEncounter?enrolUuid=${uuid}`
    : `/app/subject/encounter?subjectUuid=${uuid}`;

  return (
    <Fragment>
      {sections
        ? sections.map((section, index) => (
            <>
              <Paper className={classes.root}>
                <Typography gutterBottom>{section.title}</Typography>
                <Paper>
                  <Table className={classes.tableContainer} size="small" aria-label="a dense table">
                    <TableHead>
                      <TableRow key={index}>
                        <TableCell className={classes.tableHeader}>{t("name")}</TableCell>
                        {isEqual(section.title, t("plannedVisits")) ? (
                          <TableCell className={classes.tableHeader}>{t("Date")}</TableCell>
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
                              <TableCell className={classes.tableCell} component="th" scope="row" width="50%">
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
                              </TableCell>
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
              </Paper>
              <LineBreak num={1} />
            </>
          ))
        : ""}
    </Fragment>
  );
};

export default NewVisitMenuView;
