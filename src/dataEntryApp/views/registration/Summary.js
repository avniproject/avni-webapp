import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import Observations from "dataEntryApp/components/Observations";
import { useTranslation } from "react-i18next";
import { flatten, isEmpty, join } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import ScheduledVisitsTable from "dataEntryApp/components/ScheduledVisitsTable";
import Box from "@material-ui/core/Box";
import {
  selectFetchingVisitSchedules,
  selectVisitSchedules,
  selectVisitSchedulesError
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
  const fetchingVisitSchedules = useSelector(selectFetchingVisitSchedules);
  const visitSchedulesError = useSelector(selectVisitSchedulesError);

  useEffect(() => {
    dispatch(fetchVisitSchedules());
  }, []);

  if (visitSchedulesError) {
    return <div>Server Error: {`${visitSchedulesError}`}</div>;
  }

  if (fetchingVisitSchedules) {
    return <CustomizedBackdrop load={false} />;
  }

  const decisionsResult = visitSchedules.decisions;
  let decisions = [];

  if (decisionsResult) {
    decisions = flatten([
      decisionsResult.enrolmentDecisions,
      decisionsResult.encounterDecisions,
      decisionsResult.registrationDecisions
    ]);
    decisions = decisions.map(d => {
      const value = Array.isArray(d.value) ? join(d.value, ",") : d.value;
      return { label: d.name, value };
    });
  }

  return (
    <div className={classes.form}>
      {!isEmpty(visitSchedules.visitSchedules) && (
        <Box pb={6}>
          <Typography variant="button" display="block" gutterBottom>
            {t("Visits being scheduled")}
          </Typography>
          <Box pt={1} className={classes.tableContainer}>
            <ScheduledVisitsTable visitSchedules={visitSchedules.visitSchedules} />
          </Box>
        </Box>
      )}

      {!isEmpty(decisions) && (
        <Box pb={6}>
          <Typography variant="button" display="block" gutterBottom>
            {t("System Recommendations")}
          </Typography>
          <Box pt={1} className={classes.tableContainer}>
            <Observations observations={[]} additionalRows={decisions} highlight />
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
