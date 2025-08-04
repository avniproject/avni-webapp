import { useEffect } from "react";
import { styled } from "@mui/material/styles";
import { Typography, Box } from "@mui/material";
import Observations from "dataEntryApp/components/Observations";
import { useTranslation } from "react-i18next";
import { isEmpty } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import ScheduledVisitsTable from "dataEntryApp/components/ScheduledVisitsTable";
import {
  selectFetchingRulesResponse,
  selectRulesResponse
} from "dataEntryApp/reducers/serverSideRulesReducer";
import CustomizedBackdrop from "dataEntryApp/components/CustomizedBackdrop";

const StyledForm = styled("div")(({ theme }) => ({
  padding: theme.spacing(4, 3)
}));

const StyledTableContainer = styled(Box)(({ theme }) => ({
  maxWidth: "66.66%",
  paddingTop: theme.spacing(1)
}));

const StyledSection = styled(Box)(({ theme }) => ({
  paddingBottom: theme.spacing(6)
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  display: "block",
  marginBottom: theme.spacing(1)
}));

const Summary = ({
  observations,
  additionalRows,
  form,
  fetchRulesResponse
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const rulesResponse = useSelector(selectRulesResponse);
  const fetchingRulesResponse = useSelector(selectFetchingRulesResponse);

  useEffect(() => {
    if (fetchRulesResponse) {
      dispatch(fetchRulesResponse());
    }
  }, [dispatch, fetchRulesResponse]);

  if (fetchingRulesResponse) {
    return <CustomizedBackdrop load={false} />;
  }

  return (
    <StyledForm>
      {!isEmpty(rulesResponse.decisionObservations) && (
        <StyledSection>
          <StyledTypography variant="button">
            {t("systemRecommendations")}
          </StyledTypography>
          <StyledTableContainer>
            <Observations
              observations={rulesResponse.decisionObservations}
              additionalRows={[]}
              highlight
            />
          </StyledTableContainer>
        </StyledSection>
      )}
      {!isEmpty(rulesResponse.visitSchedules) && (
        <StyledSection>
          <StyledTypography variant="button">
            {t("visitsBeingScheduled")}
          </StyledTypography>
          <StyledTableContainer>
            <ScheduledVisitsTable
              visitSchedules={rulesResponse.visitSchedules}
            />
          </StyledTableContainer>
        </StyledSection>
      )}
      {!isEmpty(observations) && (
        <StyledSection>
          <StyledTypography variant="button">
            {t("observations")}
          </StyledTypography>
          <StyledTableContainer>
            <Observations
              observations={observations ? observations : []}
              additionalRows={additionalRows ? additionalRows : []}
              form={form}
            />
          </StyledTableContainer>
        </StyledSection>
      )}
    </StyledForm>
  );
};

export default Summary;
