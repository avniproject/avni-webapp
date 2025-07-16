import { styled } from "@mui/material/styles";
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Observations from "dataEntryApp/components/Observations";
import ScheduledVisitsTable from "dataEntryApp/components/ScheduledVisitsTable";
import { useTranslation } from "react-i18next";
import { isEmpty } from "lodash";
import CustomizedBackdrop from "dataEntryApp/components/CustomizedBackdrop";

const StyledAccordion = styled(Accordion)({
  marginBottom: "11px",
  borderRadius: "5px",
  boxShadow: "0px 0px 3px 0px rgba(0,0,0,0.4), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)"
});

const StyledAccordionSummary = styled(AccordionSummary)({
  "& .MuiAccordionSummary-expandIconWrapper": {
    color: "#0e6eff"
  }
});

const StyledAccordionDetails = styled(AccordionDetails)({
  padding: "16px",
  display: "block"
});

const StyledHeading = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(16),
  fontWeight: 500,
  flexBasis: "33.33%",
  flexShrink: 0,
  margin: 0
}));

const StyledBox = styled(Box)({
  marginBottom: "16px"
});

const RuleSummary = ({ isFetching, title, summaryObservations }) => {
  const { t } = useTranslation();

  if (isFetching) {
    return <CustomizedBackdrop load={false} />;
  }

  const noContent =
    isEmpty(summaryObservations?.decisionObservations) &&
    isEmpty(summaryObservations?.visitSchedules) &&
    isEmpty(summaryObservations?.observations);

  return (
    <StyledAccordion>
      <StyledAccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="registrationPanelbh-content" id="summary">
        <StyledHeading component="span">{t(title)}</StyledHeading>
      </StyledAccordionSummary>

      <StyledAccordionDetails>
        {!isEmpty(summaryObservations?.decisionObservations) && (
          <StyledBox>
            <Typography variant="button" display="block" gutterBottom>
              {t("systemRecommendations")}
            </Typography>
            <Observations observations={summaryObservations.decisionObservations} additionalRows={[]} highlight />
          </StyledBox>
        )}

        {!isEmpty(summaryObservations?.visitSchedules) && (
          <StyledBox>
            <Typography variant="button" display="block" gutterBottom>
              {t("visitsBeingScheduled")}
            </Typography>
            <ScheduledVisitsTable visitSchedules={summaryObservations.visitSchedules} />
          </StyledBox>
        )}

        {!isEmpty(summaryObservations?.observations) && (
          <StyledBox>
            <Typography variant="button" display="block" gutterBottom>
              {t("observations")}
            </Typography>
            <Observations observations={summaryObservations.observations} additionalRows={[]} form={null} />
          </StyledBox>
        )}

        {noContent && (
          <StyledBox>
            <Typography component="span">{t("summaryNotFound")}</Typography>
          </StyledBox>
        )}
      </StyledAccordionDetails>
    </StyledAccordion>
  );
};

export default RuleSummary;
