import { AccordionSummary } from "@mui/material";
import { withStyles } from "@mui/styles";
import React from "react";

export const CustomisedAccordionSummary = withStyles({
  root: {
    backgroundColor: "rgba(0,0,0,0.07)",
    borderBottom: "1px solid rgba(0,0,0,.125)",
    marginBottom: -1,
    minHeight: 40,
    "&$expanded": {
      minHeight: 40
    }
  },
  content: {
    "&$expanded": {
      margin: "12px 0"
    }
  },
  expanded: {}
})(props => <AccordionSummary {...props} />);

CustomisedAccordionSummary.muiName = "AccordionSummary";
