import React, { useEffect } from "react";
import { styled } from "@mui/material/styles";
import { Typography, Box } from "@mui/material";
import Observations from "dataEntryApp/components/Observations";
import { useTranslation } from "react-i18next";
import { isEmpty } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import ScheduledVisitsTable from "dataEntryApp/components/ScheduledVisitsTable";
import { selectFetchingRulesResponse, selectRulesResponse } from "dataEntryApp/reducers/serverSideRulesReducer";
import CustomizedBackdrop from "dataEntryApp/components/CustomizedBackdrop";

const StyledContainer = styled("div")(({ theme }) => ({
  padding: theme.spacing(4, 3)
}));

const StyledBox = styled(Box)(({ theme }) => ({
  paddingBottom: theme.spacing(6),
  paddingTop: theme.spacing(1),
  maxWidth: "66.66%"
}));

const StyledTypography = styled(Typography)({
  display: "block",
  marginBottom: 8
});

const RuleSummary = ({ observations, additionalRows, form, fetchRulesResponse }) => {
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
    <StyledContainer>
      {!isEmpty(rulesResponse.decisionObservations) && (
        <StyledBox>
          <StyledTypography variant="button">{t("systemRecommendations")}</StyledTypography>
          <Observations observations={rulesResponse.decisionObservations} additionalRows={[]} highlight />
        </StyledBox>
      )}
      {!isEmpty(rulesResponse.visitSchedules) && (
        <StyledBox>
          <StyledTypography variant="button">{t("visitsBeingScheduled")}</StyledTypography>
          <ScheduledVisitsTable visitSchedules={rulesResponse.visitSchedules} />
        </StyledBox>
      )}
      {!isEmpty(observations) && (
        <StyledBox>
          <StyledTypography variant="button">{t("observations")}</StyledTypography>
          <Observations observations={observations ? observations : []} additionalRows={additionalRows ? additionalRows : []} form={form} />
        </StyledBox>
      )}
    </StyledContainer>
  );
};

export default RuleSummary;
