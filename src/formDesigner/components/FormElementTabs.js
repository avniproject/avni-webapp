import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import FormElementDetails from "./FormElementDetails";
import { isEqual, get } from "lodash";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import { sampleFormElementRule } from "../common/SampleRule";
import { DeclarativeRuleHolder } from "rules-config";
import DeclarativeRules from "./DeclarativeRule/DeclerativeRules";

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
      <Box p={3} style={{ padding: 10 }}>
        {children}
      </Box>
    </Typography>
  );
}

function a11yProps(propIndex, index) {
  return {
    id: `vertical-tab-${propIndex + index}`,
    "aria-controls": `vertical-tabpanel-${propIndex + index}`
  };
}

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    display: "flex"
  },
  tabs: {
    marginLeft: -10,
    borderRight: `1px solid ${theme.palette.divider}`
  },
  tabsPanel: {
    width: "100%"
  }
}));

function FormElementTabs(props) {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);
  const disableFormElement = props.disableFormElement;

  function handleChange(event, newValue) {
    setValue(newValue);
  }

  const onSkipLogicRuleChange = event => {
    const warningMessage =
      "Editing the rule will reset the declarative rule. Are you sure you want to edit it?";
    const declarativeRuleHolder = DeclarativeRuleHolder.fromResource(
      props.formElementData.ruleJson
    );
    if (declarativeRuleHolder.isEmpty()) {
      props.updateSkipLogicRule(props.groupIndex, props.index, event);
    } else if (window.confirm(warningMessage)) {
      props.updateSkipLogicJSON(props.groupIndex, props.index, null);
      props.updateSkipLogicRule(props.groupIndex, props.index, event);
    }
  };

  return (
    <div className={classes.root}>
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        aria-label="Vertical tabs example"
        className={classes.tabs}
      >
        <Tab label="Details" {...a11yProps(props.indexTab, 0)} />
        <Tab label="Rule" {...a11yProps(props.indexTab, 1)} />
      </Tabs>
      <TabPanel className={classes.tabsPanel} value={value} index={0} propsIndex={props.indexTab}>
        <FormElementDetails {...props} />
      </TabPanel>
      <TabPanel className={classes.tabsPanel} value={value} index={1} propsIndex={props.indexTab}>
        {/*
          Below div is used to control scroll if you want scroll then uncomment div tag.
        */}

        {/* <div
          style={{
            borderStyle: "solid",
            borderWidth: "1px",
            minHeight: "100px",
            maxHeight: "300px",
            overflowY: "auto"
          }}
        > */}
        <DeclarativeRules
          ruleJson={props.formElementData.ruleJson}
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
        />
        <Editor
          value={props.formElementData.rule || sampleFormElementRule(props.entityName)}
          onValueChange={onSkipLogicRuleChange}
          highlight={code => highlight(code, languages.js)}
          padding={10}
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 15,
            height: "auto",
            borderStyle: "solid",
            borderWidth: "1px"
          }}
          disabled={disableFormElement}
        />
        {/* </div> */}
      </TabPanel>
    </div>
  );
}

function areEqual(prevProps, nextProps) {
  return isEqual(prevProps, nextProps);
}

export default React.memo(FormElementTabs, areEqual);
