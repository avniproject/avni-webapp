import { styled } from "@mui/material/styles";
import { Paper, Accordion, AccordionSummary, Typography, AccordionDetails } from "@mui/material";
import { Info, ExpandMore } from "@mui/icons-material";
import { useState } from "react";
import YetToBeSentMessagesTable from "./YetToBeSentMessagesTable";
import SentMessagesTable from "./SentMessagesTable";
import { useTranslation } from "react-i18next";

const StyledPaper = styled(Paper)(({ theme }) => ({
  color: "rgb(13,60,97)",
  border: "1px solid #2196f3",
  padding: theme.spacing(1),
  marginBottom: theme.spacing(1.25) // 10px
}));

const StyledInfoIcon = styled(Info)(({ theme }) => ({
  color: "#2196f3",
  verticalAlign: "middle",
  marginRight: theme.spacing(0.625) // 5px
}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  marginBottom: theme.spacing(1.375), // 11px
  borderRadius: "5px",
  boxShadow: "0px 0px 3px 1px rgba(0,0,0,0.2), 0px 1px 2px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)"
}));

const StyledAccordionSummary = styled(AccordionSummary)({
  // No additional styles needed beyond defaults
});

const StyledTypography = styled(Typography)({
  fontSize: "1rem",
  flexBasis: "33.33%",
  flexShrink: 0,
  fontWeight: "500",
  margin: 0
});

const StyledExpandMore = styled(ExpandMore)({
  color: "#0e6eff"
});

const StyledAccordionDetails = styled(AccordionDetails)({
  padding: 0,
  display: "block"
});

function MessagesView({ sentMessages, isMsgsSentAvailable, msgsYetToBeSent, isMsgsNotYetSentAvailable }) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div>
      <StyledPaper elevation={0}>
        <StyledInfoIcon />
        {"Group scheduled messages are not included in either of the messages sections listed below"}
      </StyledPaper>
      <StyledAccordion onChange={() => setIsExpanded(p => !p)}>
        <StyledAccordionSummary expandIcon={<StyledExpandMore />} aria-controls="sentMessagesPanelbh-content" id="sent-messages">
          <StyledTypography component="span">{t("sentMessages")}</StyledTypography>
        </StyledAccordionSummary>
        <StyledAccordionDetails>
          {isExpanded && <SentMessagesTable sentMessages={sentMessages || []} isMsgsSentAvailable={isMsgsSentAvailable} />}
        </StyledAccordionDetails>
      </StyledAccordion>
      <StyledAccordion>
        <StyledAccordionSummary
          expandIcon={<StyledExpandMore />}
          aria-controls="yetToBeSentMessagesPanelbh-content"
          id="yet-to-be-sent-messages"
        >
          <StyledTypography component="span">{t("scheduledMessages")}</StyledTypography>
        </StyledAccordionSummary>
        <StyledAccordionDetails>
          <YetToBeSentMessagesTable msgsYetToBeSent={msgsYetToBeSent || []} isMsgsNotYetSentAvailable={isMsgsNotYetSentAvailable} />
        </StyledAccordionDetails>
      </StyledAccordion>
    </div>
  );
}

export default MessagesView;
