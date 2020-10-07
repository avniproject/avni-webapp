import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Table, TableBody, TableCell, TableRow, Typography, List, Grid } from "@material-ui/core";
import Observations from "dataEntryApp/components/Observations";
import { LineBreak } from "common/components/utils";
import { useTranslation } from "react-i18next";
import { isEmpty } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import ScheduledVisitsTable from "dataEntryApp/components/ScheduledVisitsTable";
import Box from "@material-ui/core/Box";
import {
  selectVisitSchedules,
  selectIsFetching,
  selectError
} from "dataEntryApp/reducers/visitScheduleReducer";
import CustomizedBackdrop from "dataEntryApp/components/CustomizedBackdrop";

const useStyle = makeStyles(theme => ({
  form: {
    padding: theme.spacing(4, 3)
  },
  tableContainer: {
    maxWidth: "66.66%"
  }
}));

const Summary = ({ observations, additionalRows, form, fetchVisitSchedules }) => {
  const classes = useStyle();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const visitSchedules = useSelector(selectVisitSchedules);
  const isFetching = useSelector(selectIsFetching);
  const error = useSelector(selectError);

  // const status = useSelector(state => state.dataEntry.visitScheduleReducer.status)
  // const error = useSelector(state => state.dataEntry.visitScheduleReducer.error)

  useEffect(() => {
    // if(status === 'idle') {
    dispatch(fetchVisitSchedules());
    // }
  }, []);

  if (error) {
    return <div>Server Error: {error}</div>;
  }

  return isFetching ? (
    <CustomizedBackdrop load={false} />
  ) : (
    <div className={classes.form}>
      {!isEmpty(visitSchedules) && (
        <Box pb={6}>
          <Typography variant="button" display="block" gutterBottom>
            {t("Visits being scheduled")}
          </Typography>
          <Box pt={1} className={classes.tableContainer}>
            <ScheduledVisitsTable visitSchedules={visitSchedules} />
          </Box>
        </Box>
      )}

      {!isEmpty(observations) && (
        <Box>
          <Typography variant="button" display="block" gutterBottom>
            {t("OBSERVATIONS")}
          </Typography>
          <Box pt={1} className={classes.tableContainer}>
            <Observations
              observations={observations ? observations : []}
              additionalRows={additionalRows ? additionalRows : []}
              form={form}
            />
          </Box>
        </Box>
      )}
    </div>
  );
};
export default Summary;
