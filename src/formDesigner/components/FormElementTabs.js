import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import FormElementDetails from "./FormElementDetails";
import { isEqual } from "lodash";
import TextareaAutosize from "@material-ui/core/TextareaAutosize";

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

  function handleChange(event, newValue) {
    setValue(newValue);
  }

  console.log(`FormElementTabs: render`);
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
        <Tab label="Rules" {...a11yProps(props.indexTab, 1)} />
      </Tabs>
      <TabPanel className={classes.tabsPanel} value={value} index={0} propsIndex={props.indexTab}>
        <FormElementDetails {...props} />
      </TabPanel>
      <TabPanel className={classes.tabsPanel} value={value} index={1} propsIndex={props.indexTab}>
        {/* <SyntaxHighlighter language="javascript" style={docco}>
          {`'use strict'; 
function rule(params, imports) {`}
        </SyntaxHighlighter> */}

        {/* <div>{`'use strict';`} </div>
        <div>{`function rule(params, imports) {`}</div> */}

        {/* <AceEditor
          placeholder="Enter code without function tag"
          mode="javascript"
          onChange={value => props.updateSkipLogicRule(props.groupIndex, props.index, value)}
          fontSize={16}
          height="300px"
          width="600px"
          showPrintMargin={true}
          showGutter={true}
          highlightActiveLine={true}
          value={props.formElementData.rule}
          setOptions={{
            showLineNumbers: true,
            tabSize: 1
          }}
        /> */}

        <TextareaAutosize
          rowsMin={8}
          style={{ height: "300px", width: "100%", marginTop: "2%" }}
          placeholder="Enter skip logic here"
          value={props.formElementData.rule}
          onChange={event =>
            props.updateSkipLogicRule(props.groupIndex, props.index, event.target.value)
          }
        />
        {/* <SyntaxHighlighter language="javascript" style={docco}>
          {`}; 
rule;`}
        </SyntaxHighlighter> */}
        {/* <div>{`}; `}</div>
        <div>{`rule;`}</div> */}
      </TabPanel>
    </div>
  );
}

function areEqual(prevProps, nextProps) {
  return isEqual(prevProps, nextProps);
}

export default React.memo(FormElementTabs, areEqual);
