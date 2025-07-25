import { useState, Fragment } from "react";
import { styled } from "@mui/material/styles";
import { AppBar, Tabs, Tab, Typography, Paper, Box } from "@mui/material";
import PropTypes from "prop-types";
import SubjectDashboardProfileTab from "./SubjectDashboardProfileTab";
import SubjectDashboardGeneralTab from "./SubjectDashboardGeneralTab";
import SubjectDashboardProgramTab from "./SubjectDashboardProgramTab";
import { Description, List, Assessment } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const StyledAppBar = styled(AppBar)({
  backgroundColor: "white",
  boxShadow: "none"
});

const StyledTabs = styled(Tabs)({
  "& button": {
    marginTop: "20px",
    minHeight: "0px"
  }
});

const StyledTab = styled(Tab)({
  "& span": {
    flexDirection: "row",
    "& svg": {
      marginRight: "6px",
      marginTop: "3px"
    }
  }
});

const StyledPaper = styled(Paper)({
  margin: "-23px",
  elevation: 2
});

const StyledBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3)
}));

const StyledTabContent = styled(Typography)({});

function TabContent(props) {
  const { children, value, index, ...other } = props;

  return (
    <StyledTabContent
      component="span"
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      {...other}
    >
      {value === index && <StyledBox>{children}</StyledBox>}
    </StyledTabContent>
  );
}

TabContent.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired
};

const SubjectDashboardTabs = ({
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

  const [value, setValue] = useState(
    tab && tab > 0 ? (showProgramTab ? tab : tab - 1) : defaultTabIndex
  );

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
      <StyledAppBar position="static" color="default">
        {showProgramTab && (
          <StyledTabs
            value={value}
            onChange={handleChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            aria-label="scrollable auto tabs example"
          >
            {showProgramTab && (
              <StyledTab
                label={t("programs")}
                icon={<Assessment id="program-tab" />}
                {...a11yProps(0)}
              />
            )}
            <StyledTab
              label={t("profile")}
              icon={<Description id="profile-tab" />}
              {...a11yProps(registrationTabIndex)}
            />
            {showGeneralTab && (
              <StyledTab
                label={t("General")}
                icon={<List id="general-tab" />}
                {...a11yProps(generalTabIndex)}
              />
            )}
          </StyledTabs>
        )}
      </StyledAppBar>
      {showProgramTab && (
        <TabContent value={value} index={0}>
          <StyledPaper>
            <SubjectDashboardProgramTab
              program={program}
              handleUpdateComponent={handleUpdateComponent}
              subjectTypeUuid={profile.subjectType.uuid}
              subjectVoided={profile.voided}
            />
          </StyledPaper>
        </TabContent>
      )}
      <TabContent value={value} index={registrationTabIndex}>
        <StyledPaper>
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
        </StyledPaper>
      </TabContent>
      {showGeneralTab && (
        <TabContent value={value} index={generalTabIndex}>
          <StyledPaper>
            <SubjectDashboardGeneralTab
              subjectUuid={profile.uuid}
              general={general}
              subjectTypeUuid={profile.subjectType.uuid}
              subjectVoided={profile.voided}
              voidError={voidError}
            />
          </StyledPaper>
        </TabContent>
      )}
    </Fragment>
  );
};

export default SubjectDashboardTabs;
