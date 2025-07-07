import { AccordionSummary } from "@mui/material";
import { styled } from "@mui/material/styles";

const CustomisedAccordionSummary = styled(AccordionSummary)({
  backgroundColor: "rgba(0,0,0,0.07)",
  borderBottom: "1px solid rgba(0,0,0,.125)",
  marginBottom: -1,
  minHeight: 40,
  "&.Mui-expanded": {
    minHeight: 40
  },
  "& .MuiAccordionSummary-content.Mui-expanded": {
    margin: "12px 0"
  }
});

CustomisedAccordionSummary.muiName = "AccordionSummary";

export { CustomisedAccordionSummary };
