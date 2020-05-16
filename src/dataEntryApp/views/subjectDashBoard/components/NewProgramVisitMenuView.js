import React, { Fragment } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import { isEqual, isNil } from "lodash";
import {
  Table,
  TableBody,
  TableHead,
  TableCell,
  TableRow,
  Typography,
  Paper
} from "@material-ui/core";
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

const NewProgramVisitMenuView = ({ sections, enrolmentUuid }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <Fragment>
      {sections
        ? sections.map(section => (
            <div>
              <Paper className={classes.root}>
                <Typography gutterBottom>{section.title}</Typography>
                <Paper>
                  <Table className={classes.table} size="small" aria-label="a dense table">
                    <TableHead>
                      <TableRow>
                        <TableCell className={classes.tableHeader}>{t("Name")}</TableCell>
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
                          <TableRow>
                            {encounter.encounterType ? (
                              <TableCell
                                className={classes.tableCell}
                                component="th"
                                scope="row"
                                width="50%"
                              >
                                <InternalLink
                                  to={`/app/subject/programEncounter?uuid=${
                                    encounter.encounterType.uuid
                                  }&enrolUuid=${enrolmentUuid}`}
                                >
                                  {encounter.name}
                                </InternalLink>
                              </TableCell>
                            ) : (
                              ""
                            )}
                            <TableCell align="left" width="50%">
                              {encounter.earliestVisitDateTime &&
                                General.toDisplayDate(encounter.earliestVisitDateTime)}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </Paper>
              </Paper>
              <LineBreak num={1} />
            </div>
          ))
        : ""}
    </Fragment>
  );
};

export default NewProgramVisitMenuView;
