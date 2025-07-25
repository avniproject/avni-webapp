import { useState, memo } from "react";
import { styled } from "@mui/material/styles";
import { Tabs, Tab, Typography } from "@mui/material";
import FormElementDetails from "./FormElementDetails";
import { isEqual, get } from "lodash";
import { sampleFormElementRule } from "../common/SampleRule";
import { confirmBeforeRuleEdit } from "../util";
import RuleDesigner from "./DeclarativeRule/RuleDesigner";

const StyledRoot = styled("div")(({ theme }) => ({
  flexGrow: 1,
  backgroundColor: theme.palette.background.paper,
  display: "flex",
  minHeight: "100%" // Ensure consistent height
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderRight: `1px solid ${theme.palette.divider}`,
  minWidth: theme.spacing(20), // Fixed minimum width for tabs
  maxWidth: theme.spacing(20), // Prevent tabs from growing too wide
  "& .MuiTab-root": {
    paddingRight: theme.spacing(5),
    paddingLeft: theme.spacing(2), // Consistent padding
    textAlign: "left", // Align text for better UX
    justifyContent: "flex-start" // Align content to start
  }
}));

const StyledTabPanelContainer = styled("div")(({ theme }) => ({
  padding: theme.spacing(3),
  width: "100%",
  boxSizing: "border-box" // Prevent padding from affecting width
}));

function TabPanel(props) {
  const { children, value, index, propsIndex, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${propsIndex + index}`}
      aria-labelledby={`vertical-tab-${propsIndex + index}`}
      {...other}
    >
      <StyledTabPanelContainer>{children}</StyledTabPanelContainer>
    </Typography>
  );
}

function a11yProps(propIndex, index) {
  return {
    id: `vertical-tab-${propIndex + index}`,
    "aria-controls": `vertical-tabpanel-${propIndex + index}`
  };
}

function FormElementTabs(props) {
  const [value, setValue] = useState(0);
  const disableFormElement = props.disableFormElement;

  function handleChange(event, newValue) {
    setValue(newValue);
  }

  const onSkipLogicRuleChange = event => {
    confirmBeforeRuleEdit(
      props.formElementData.declarativeRule,
      () => props.updateSkipLogicRule(props.groupIndex, props.index, event),
      () => props.updateSkipLogicJSON(props.groupIndex, props.index, null)
    );
  };

  return (
    <StyledRoot>
      <StyledTabs
        orientation="vertical"
        value={value}
        onChange={handleChange}
        aria-label="Vertical tabs for form element"
      >
        <Tab label="Details" {...a11yProps(props.indexTab, 0)} />
        <Tab label="Rule" {...a11yProps(props.indexTab, 1)} />
      </StyledTabs>
      <TabPanel value={value} index={0} propsIndex={props.indexTab}>
        <FormElementDetails {...props} />
      </TabPanel>
      <TabPanel value={value} index={1} propsIndex={props.indexTab}>
        <RuleDesigner
          rulesJson={props.formElementData.declarativeRule}
          onValueChange={jsonData =>
            props.updateSkipLogicJSON(props.groupIndex, props.index, jsonData)
          }
          updateJsCode={declarativeRuleHolder =>
            props.updateSkipLogicRule(
              props.groupIndex,
              props.index,
              declarativeRuleHolder.generateViewFilterRule(props.entityName)
            )
          }
          jsCode={props.formElementData.rule}
          error={get(props.formElementData, "errorMessage.ruleError")}
          subjectType={props.subjectType}
          form={props.form}
          getApplicableActions={state => state.getApplicableViewFilterActions()}
          sampleRule={sampleFormElementRule(props.entityName)}
          onJsCodeChange={onSkipLogicRuleChange}
          disableEditor={disableFormElement}
          parentConceptUuid={props.parentConceptUuid}
        />
      </TabPanel>
    </StyledRoot>
  );
}

function areEqual(prevProps, nextProps) {
  return isEqual(prevProps, nextProps);
}

export default memo(FormElementTabs, areEqual);
