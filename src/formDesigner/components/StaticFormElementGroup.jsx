import { useState } from "react";
import { ExpandMore, ExpandLess, Group } from "@mui/icons-material";
import { ToolTip } from "../../common/components/ToolTip";
import StaticFormElement from "../StaticFormElement";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
  Typography,
  styled,
  Tooltip,
  FormControl,
  Input,
  useTheme,
} from "@mui/material";

const StyledParent = styled("div")(({ theme }) => ({
  paddingLeft: 0,
  paddingBottom: theme.spacing(4),
}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  width: "100%",
  "&.Mui-expanded": {
    margin: 0,
  },
  backgroundColor: "#E0E0E0",
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  position: "relative",
  backgroundColor: "#dbdbdb",
  paddingLeft: 0,
  paddingRight: 0,
  minHeight: 56,
  "&.Mui-expanded": {
    minHeight: 56,
  },
  "&.Mui-focused": {
    backgroundColor: "#dbdbdb",
  },
  "& .MuiAccordionSummary-content": {
    margin: theme.spacing(1),
    "&.Mui-expanded": {
      margin: theme.spacing(1),
    },
  },
  "& .MuiAccordionSummary-expandIconWrapper": {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    display: "inline",
  },
}));

const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
  padding: 0,
}));

const StyledGroupIcon = styled(Group)(({ theme }) => ({
  marginLeft: theme.spacing(0.75),
  marginRight: theme.spacing(0.25),
}));

const StyledExpandIcon = styled(({ expanded, ...props }) =>
  expanded ? <ExpandLess {...props} /> : <ExpandMore {...props} />,
)(({ theme }) => ({
  marginLeft: theme.spacing(0.25),
  marginRight: theme.spacing(0.75),
  display: "inline",
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(15),
}));

const StyledQuestionCount = styled(Typography)(({ theme }) => ({
  paddingTop: theme.spacing(0.625),
}));

const StyledFormElementContainer = styled("div")({
  paddingLeft: "20px",
  paddingBottom: "30px",
});

const StyledContentGrid = styled(Grid)({
  width: "100%",
  alignContent: "center",
  marginBottom: 8,
});

const StyledOuterGrid = styled(Grid)({
  width: "100%",
  marginTop: 20,
});

const StaticFormElementGroup = ({ name, formElements }) => {
  const panel = "static-panel";
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();

  const renderFormElements = () => {
    const groupIndex = 1;
    return formElements.map(({ dataType, name }, index) => (
      <StyledFormElementContainer key={index}>
        <StaticFormElement
          name={name}
          index={index}
          dataType={dataType}
          groupIndex={groupIndex}
        />
      </StyledFormElementContainer>
    ));
  };

  return (
    <StyledParent>
      <Grid>
        <StyledAccordion
          TransitionProps={{ mountOnEnter: true, unmountOnExit: true }}
          expanded={expanded}
          onChange={() => setExpanded(!expanded)}
        >
          <StyledAccordionSummary
            aria-controls={`${panel}-bh-content`}
            id={`${panel}-bh-header`}
          >
            <Grid
              container
              alignItems="center"
              wrap="nowrap"
              sx={{ width: "100%" }}
            >
              <Grid
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: theme.spacing(0.5),
                  flexBasis: "20%",
                }}
              >
                <Tooltip title="Grouped Questions">
                  <StyledGroupIcon />
                </Tooltip>
                <StyledExpandIcon expanded={expanded} />
              </Grid>

              <Grid
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: theme.spacing(0.5),
                  flexBasis: "50%",
                }}
              >
                <StyledTypography sx={{ flex: 1, minWidth: 120 }}>
                  <FormControl fullWidth>
                    <Input
                      type="text"
                      placeholder="Group name"
                      name={`name${panel}`}
                      disableUnderline
                      value={name}
                      autoComplete="off"
                      disabled
                    />
                  </FormControl>
                </StyledTypography>
              </Grid>

              <Grid
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: theme.spacing(0.5),
                  flexBasis: "15%",
                }}
              >
                <StyledQuestionCount
                  component="div"
                  sx={{ whiteSpace: "nowrap" }}
                >
                  {formElements.length} questions
                </StyledQuestionCount>
              </Grid>

              <Grid
                item
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: theme.spacing(0.5),
                  flexBasis: "15%",
                  justifyContent: "flex-end",
                }}
              >
                <ToolTip
                  toolTipKey="APP_DESIGNER_FORM_ELEMENT_GROUP_NAME"
                  displayPosition="top"
                />
              </Grid>
            </Grid>
          </StyledAccordionSummary>
          <StyledAccordionDetails>
            <StyledOuterGrid direction="column">
              <StyledContentGrid>{renderFormElements()}</StyledContentGrid>
            </StyledOuterGrid>
          </StyledAccordionDetails>
        </StyledAccordion>
      </Grid>
    </StyledParent>
  );
};

export default StaticFormElementGroup;
