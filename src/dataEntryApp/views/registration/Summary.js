import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import Observations from "dataEntryApp/components/Observations";
import { useTranslation } from "react-i18next";
import { isEmpty } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import ScheduledVisitsTable from "dataEntryApp/components/ScheduledVisitsTable";
import Box from "@material-ui/core/Box";
import {
  selectError,
  selectFetchingRulesResponse,
  selectRulesResponse
} from "dataEntryApp/reducers/serverSideRulesReducer";
import CustomizedBackdrop from "dataEntryApp/components/CustomizedBackdrop";

const useStyle = makeStyles(theme => ({
  form: {
    padding: theme.spacing(4, 3)
  },
  tableContainer: {
    maxWidth: "66.66%"
  }
}));

const Summary = ({ observations, additionalRows, form, fetchRulesResponse }) => {
  const classes = useStyle();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const rulesResponse = useSelector(selectRulesResponse);
  const fetchingRulesResponse = useSelector(selectFetchingRulesResponse);
  const rulesError = useSelector(selectError);

  useEffect(() => {
    dispatch(fetchRulesResponse());
  }, []);

  if (fetchingRulesResponse) {
    return <CustomizedBackdrop load={false} />;
  }

  return (
    <div className={classes.form}>
      {!isEmpty(rulesResponse.decisionObservations) && (
        <Box pb={6}>
          <Typography variant="button" display="block" gutterBottom>
            {t("System Recommendations")}
          </Typography>
          <Box pt={1} className={classes.tableContainer}>
            <Observations
              observations={rulesResponse.decisionObservations}
              additionalRows={[]}
              highlight
            />
          </Box>
        </Box>
      )}

      {!isEmpty(rulesResponse.visitSchedules) && (
        <Box pb={6}>
          <Typography variant="button" display="block" gutterBottom>
            {t("Visits being scheduled")}
          </Typography>
          <Box pt={1} className={classes.tableContainer}>
            <ScheduledVisitsTable visitSchedules={rulesResponse.visitSchedules} />
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
