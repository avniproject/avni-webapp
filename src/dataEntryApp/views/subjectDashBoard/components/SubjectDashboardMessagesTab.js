import { Fragment } from "react";
import { styled } from "@mui/material/styles";
import { Paper, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import MessagesView from "../../../../common/components/messages/MessagesView";

const StyledPaper = styled(Paper)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(2),
  boxShadow: "0px 0px 4px 1px rgba(0,0,0,0.3)"
}));

const StyledTypography = styled(Typography)({
  fontSize: "1rem",
  flexBasis: "33.33%",
  flexShrink: 0,
  fontWeight: "500",
  margin: "0",
  paddingBottom: 10,
  display: "block"
});

const SubjectDashboardMessagesTab = ({ sentMessages, isMsgsSentAvailable, msgsYetToBeSent, isMsgsNotYetSentAvailable }) => {
  const { t } = useTranslation();

  return (
    <Fragment>
      <StyledPaper>
        <StyledTypography component="span">{t("Messages")}</StyledTypography>
        <MessagesView
          isMsgsNotYetSentAvailable={isMsgsNotYetSentAvailable}
          isMsgsSentAvailable={isMsgsSentAvailable}
          msgsYetToBeSent={msgsYetToBeSent}
          sentMessages={sentMessages}
        />
      </StyledPaper>
    </Fragment>
  );
};

export default SubjectDashboardMessagesTab;
