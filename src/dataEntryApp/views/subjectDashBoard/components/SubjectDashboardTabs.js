import React, { Fragment } from "react";
import { makeStyles } from "@mui/styles";
import { AppBar, Tabs, Tab, Typography, Paper, Box } from "@mui/material";
import PropTypes from "prop-types";
import SubjectDashboardProfileTab from "./SubjectDashboardProfileTab";
import SubjectDashboardGeneralTab from "./subjectDashboardGeneralTab";
import SubjectDashboardProgramTab from "./subjectDashboardProgramTab";
import { Description, List, Assessment } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles(theme => ({
  tabsDisplay: {
    margin: "-23px"
  },
  tabView: {
    backgroundColor: "white",
    boxShadow: "none"
  },
  MuiTab: {
    wrapper: {
      flexDirection: "row"
    }
  },
  wrapper: {
    "& span": {
      flexDirection: "row",
      "& svg": {
        marginRight: "6px",
        marginTop: "3px"
      }
    },
    "& button": {
      marginTop: "20px",
      minHeight: "0px"
    }
  }
}));

function TabContent(props) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component={"span"}
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box
          sx={{
            p: 3
          }}
        >
          {children}
        </Box>
      )}
    </Typography>
  );
}

TabContent.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired
};

export default ({
  profile,
  general,
  program,
  msgs,
  handleUpdateComponent,
  voidSubject,
  unVoidSubject,
  registrationForm,
  tab,
  tabsStatus = {},
  getGroupMembers,
  groupMembers,
  voidError,
  clearVoidServerError,
  unVoidErrorKey
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const {
    showProgramTab,
    showGeneralTab,
    showRelatives,
    defaultTabIndex,
    registrationTabIndex,
    generalTabIndex,
    showGroupMembers,
    hideDOB,
    displayGeneralInfoInProfileTab,
    showMessagesTab
  } = tabsStatus;

  const [value, setValue] = React.useState(tab && tab > 0 ? (showProgramTab ? tab : tab - 1) : defaultTabIndex);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  function a11yProps(index) {
    return {
      id: `scrollable-auto-tab-${index}`,
      "aria-controls": `scrollable-auto-tabpanel-${index}`
    };
  }

  return (
    <Fragment>
      <AppBar className={classes.tabView} position="static" color="default">
        {showProgramTab && (
          <Tabs
            value={value}
            onChange={handleChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            aria-label="scrollable auto tabs example"
            className={classes.wrapper}
          >
            {showProgramTab && <Tab label={t("programs")} icon={<Assessment id={"program-tab"} />} {...a11yProps(0)} />}
            <Tab label={t("profile")} icon={<Description id={"profile-tab"} />} {...a11yProps(registrationTabIndex)} />
            {showGeneralTab && <Tab label={t("General")} icon={<List id={"general-tab"} />} {...a11yProps(generalTabIndex)} />}
          </Tabs>
        )}
      </AppBar>
      {showProgramTab && (
        <TabContent value={value} index={0}>
          <Paper className={classes.tabsDisplay}>
            <SubjectDashboardProgramTab
              program={program}
              handleUpdateComponent={handleUpdateComponent}
              subjectTypeUuid={profile.subjectType.uuid}
              subjectVoided={profile.voided}
            />
          </Paper>
        </TabContent>
      )}
      <TabContent value={value} index={registrationTabIndex}>
        <Paper className={classes.tabsDisplay}>
          <SubjectDashboardProfileTab
            unVoidErrorKey={unVoidErrorKey}
            profile={profile}
            voidSubject={voidSubject}
            voidError={voidError}
            clearVoidServerError={clearVoidServerError}
            unVoidSubject={unVoidSubject}
            registrationForm={registrationForm}
            showRelatives={showRelatives}
            showGroupMembers={showGroupMembers}
            getGroupMembers={getGroupMembers}
            groupMembers={groupMembers}
            hideDOB={hideDOB}
            displayGeneralInfoInProfileTab={displayGeneralInfoInProfileTab}
            general={general}
            msgs={msgs}
            showMessagesTab={showMessagesTab}
          />
        </Paper>
      </TabContent>
      {showGeneralTab && (
        <TabContent value={value} index={generalTabIndex}>
          <Paper className={classes.tabsDisplay}>
            <SubjectDashboardGeneralTab
              subjectUuid={profile.uuid}
              general={general}
              subjectTypeUuid={profile.subjectType.uuid}
              subjectVoided={profile.voided}
              voidError={voidError}
            />
          </Paper>
        </TabContent>
      )}
    </Fragment>
  );
};
