import { makeStyles } from "@mui/styles";
import { Paper, Accordion, AccordionSummary, Typography, AccordionDetails } from "@mui/material";
import { bold } from "ansi-colors";
import { Info, ExpandMore } from "@mui/icons-material";
import React from "react";
import YetToBeSentMessagesTable from "./YetToBeSentMessagesTable";
import SentMessagesTable from "./SentMessagesTable";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles(theme => ({
  expansionHeading: {
    fontSize: "1rem",
    flexBasis: "33.33%",
    flexShrink: 0,
    fontWeight: "500",
    margin: "0"
  },
  expansionSecondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary
  },
  expansionSubHeading: {
    fontSize: theme.typography.pxToRem(13),
    flexBasis: "33.33%",
    flexShrink: 0,
    fontWeight: "400",
    margin: "0"
  },
  listItemView: {
    border: "1px solid lightGrey"
  },
  expansionPanel: {
    marginBottom: "11px",
    borderRadius: "5px",
    boxShadow: "0px 0px 3px 1px rgba(0,0,0,0.2), 0px 1px 2px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)"
  },
  card: {
    boxShadow: "0px 0px 0px 0px rgba(0,0,0,0.12)",
    borderRight: "1px solid rgba(0,0,0,0.12)",
    borderRadius: "0"
  },
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)"
  },
  title: {
    fontSize: 14
  },
  headingBold: {
    fontWeight: bold
  },
  gridBottomBorder: {
    borderBottom: "1px solid rgba(0,0,0,0.12)",
    paddingBottom: "10px"
  },
  infomsg: {
    marginLeft: 10
  },
  expandMoreHoriz: {
    color: "#0e6eff"
  },
  outlinedInfo: {
    color: "rgb(13,60,97)",
    border: "1px solid #2196f3",
    icon: {
      color: "#2196f3"
    },
    padding: theme.spacing(1),
    marginBottom: "10px"
  }
}));

function MessagesView({ sentMessages, isMsgsSentAvailable, msgsYetToBeSent, isMsgsNotYetSentAvailable }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div>
      <Paper elevation={0} className={classes.outlinedInfo}>
        <div>
          {<Info />} {"Group scheduled messages are not included in either of the messages sections listed below"}
        </div>
      </Paper>
      <Accordion className={classes.expansionPanel} onChange={() => setIsExpanded(p => !p)}>
        <AccordionSummary
          expandIcon={<ExpandMore className={classes.expandMoreHoriz} />}
          aria-controls="sentMessagesPanelbh-content"
          id="sent-messages"
        >
          <Typography component={"span"} className={classes.expansionHeading}>
            {t("sentMessages")}
          </Typography>
        </AccordionSummary>
        <AccordionDetails style={{ padding: 0, display: "block" }}>
          {isExpanded && <SentMessagesTable sentMessages={sentMessages || []} isMsgsSentAvailable={isMsgsSentAvailable} />}
        </AccordionDetails>
      </Accordion>
      <Accordion className={classes.expansionPanel}>
        <AccordionSummary
          expandIcon={<ExpandMore className={classes.expandMoreHoriz} />}
          aria-controls="yetToBeSentMessagesPanelbh-content"
          id="yet-to-be-sent-messages"
        >
          <Typography component={"span"} className={classes.expansionHeading}>
            {t("scheduledMessages")}
          </Typography>
        </AccordionSummary>
        <AccordionDetails style={{ padding: 0, display: "block" }}>
          <YetToBeSentMessagesTable msgsYetToBeSent={msgsYetToBeSent || []} isMsgsNotYetSentAvailable={isMsgsNotYetSentAvailable} />
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

export default MessagesView;
