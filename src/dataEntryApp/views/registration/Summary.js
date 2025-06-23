import React, { useEffect } from "react";
import { makeStyles } from "@mui/styles";
import { Typography, Box } from "@mui/material";
import Observations from "dataEntryApp/components/Observations";
import { useTranslation } from "react-i18next";
import { isEmpty } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import ScheduledVisitsTable from "dataEntryApp/components/ScheduledVisitsTable";
import { selectFetchingRulesResponse, selectRulesResponse } from "dataEntryApp/reducers/serverSideRulesReducer";
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

  useEffect(() => {
    dispatch(fetchRulesResponse());
  }, []);

  if (fetchingRulesResponse) {
    return <CustomizedBackdrop load={false} />;
  }

  return (
    <div className={classes.form}>
      {!isEmpty(rulesResponse.decisionObservations) && (
        <Box
          sx={{
            pb: 6
          }}
        >
          <Typography
            variant="button"
            sx={{
              display: "block",
              mb: 1
            }}
          >
            {t("systemRecommendations")}
          </Typography>
          <Box
            className={classes.tableContainer}
            sx={{
              pt: 1
            }}
          >
            <Observations observations={rulesResponse.decisionObservations} additionalRows={[]} highlight />
          </Box>
        </Box>
      )}
      {!isEmpty(rulesResponse.visitSchedules) && (
        <Box
          sx={{
            pb: 6
          }}
        >
          <Typography
            variant="button"
            sx={{
              display: "block",
              mb: 1
            }}
          >
            {t("visitsBeingScheduled")}
          </Typography>
          <Box
            className={classes.tableContainer}
            sx={{
              pt: 1
            }}
          >
            <ScheduledVisitsTable visitSchedules={rulesResponse.visitSchedules} />
          </Box>
        </Box>
      )}
      {!isEmpty(observations) && (
        <Box>
          <Typography
            variant="button"
            sx={{
              display: "block",
              mb: 1
            }}
          >
            {t("observations")}
          </Typography>
          <Box
            className={classes.tableContainer}
            sx={{
              pt: 1
            }}
          >
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
