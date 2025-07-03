import React from "react";
import { styled } from '@mui/material/styles';
import Observations from "../../../components/Observations";
import { CircularProgress, AccordionSummary, Typography, AccordionDetails, Accordion, Grid } from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { isEmpty } from "lodash";
import { useTranslation } from "react-i18next";

const StyledAccordion = styled(Accordion)({
  marginBottom: "11px",
  borderRadius: "5px",
  boxShadow: "0px 0px 3px 1px rgba(0,0,0,0.2), 0px 1px 2px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)"
});

const StyledTypography = styled(Typography)({
  fontSize: "1rem",
  flexBasis: "33.33%",
  flexShrink: 0,
  fontWeight: "500",
  margin: "0"
});

const StyledExpandMore = styled(ExpandMore)({
  color: "#0e6eff"
});

const StyledGrid = styled(Grid)({
  container: true,
  justifyContent: "center"
});

export const RuleSummary = ({ isFetching, title, summaryObservations = [] }) => {
  const { t } = useTranslation();

  const renderNotFound = () => {
    return <Typography component="span">{t("summaryNotFound")}</Typography>;
  };

  const renderObs = () => {
    return <Grid size={12}>{isEmpty(summaryObservations) ? renderNotFound() : <Observations observations={summaryObservations} />}</Grid>;
  };

  const renderProgress = () => {
    return (
      <StyledGrid size={12}>
        <CircularProgress />
      </StyledGrid>
    );
  };

  return (
    <StyledAccordion>
      <AccordionSummary
        expandIcon={<StyledExpandMore />}
        aria-controls="registrationPanelbh-content"
        id="summary"
      >
        <Typography component="span">
          <StyledTypography component="p">{t(title)}</StyledTypography>
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container size={12}>
          {isFetching ? renderProgress() : renderObs()}
        </Grid>
      </AccordionDetails>
    </StyledAccordion>
  );
};