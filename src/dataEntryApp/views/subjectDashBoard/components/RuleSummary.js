import { styled } from "@mui/material/styles";
import { Accordion, AccordionSummary, AccordionDetails, Typography, CircularProgress, Grid } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Observations from "dataEntryApp/components/Observations";
import { useTranslation } from "react-i18next";
import { isEmpty } from "lodash";

const StyledAccordion = styled(Accordion)({
  marginBottom: "11px",
  borderRadius: "5px",
  boxShadow: "0px 0px 3px 1px rgba(0,0,0,0.2), 0px 1px 2px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)"
});

const StyledAccordionSummary = styled(AccordionSummary)({
  "& .MuiAccordionSummary-expandIconWrapper": {
    color: "#0e6eff"
  }
});

const StyledAccordionSummaryTitle = styled("p")({
  fontSize: "1rem",
  flexBasis: "33.33%",
  flexShrink: 0,
  fontWeight: 500,
  margin: 0
});

const RuleSummary = ({ isFetching, title, summaryObservations = [] }) => {
  const { t } = useTranslation();

  const renderNotFound = () => <Typography component="span">{t("summaryNotFound")}</Typography>;

  const renderObs = () => (
    <Grid xs={12}>{isEmpty(summaryObservations) ? renderNotFound() : <Observations observations={summaryObservations} />}</Grid>
  );

  const renderProgress = () => (
    <Grid container xs={12} justifyContent="center">
      <CircularProgress />
    </Grid>
  );

  return (
    <StyledAccordion>
      <StyledAccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="registrationPanelbh-content" id="summary">
        <Typography component="span">
          <StyledAccordionSummaryTitle>{t(title)}</StyledAccordionSummaryTitle>
        </Typography>
      </StyledAccordionSummary>
      <AccordionDetails>
        <Grid>{isFetching ? renderProgress() : renderObs()}</Grid>
      </AccordionDetails>
    </StyledAccordion>
  );
};

export default RuleSummary;
