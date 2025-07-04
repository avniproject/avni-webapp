import { useState, Fragment } from "react";
import { styled } from "@mui/material/styles";
import { Paper, Typography, Grid } from "@mui/material";
import ProgramDetails from "./SubjectDashboardProgramDetails";
import Program from "./Program";
import { useTranslation } from "react-i18next";
import SubjectVoided from "../../../components/SubjectVoided";

const StyledPaper = styled(Paper)({
  flexGrow: 1,
  elevation: 2
});

const StyledProgramBar = styled("div")({
  height: "100px",
  backgroundColor: "#f9f9f9"
});

const StyledTypographyNoEnrolments = styled(Typography)({
  padding: 40,
  marginBottom: 8
});

const StyledGridSpacer = styled(Grid)({
  width: "60px"
});

const SubjectDashboardProgramTab = ({ program, handleUpdateComponent, subjectTypeUuid, subjectVoided }) => {
  let flagActive = false;
  let flagExited = false;
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedTabExited, setSelectedTabExited] = useState(false);
  const { t } = useTranslation();

  const handleTabChange = (event, newValue) => {
    setSelectedTabExited(false);
    setSelectedTab(newValue);
  };

  const handleTabChangeExited = (event, newValue) => {
    setSelectedTab(false);
    setSelectedTabExited(newValue);
  };

  if (program && program.enrolments) {
    program.enrolments.sort((left, right) => (left.programExitDateTime ? 1 : right.programExitDateTime ? -1 : 0));
  }

  function isActive(element) {
    return element.programExitDateTime == null;
  }

  function isExited(element) {
    return element.programExitDateTime != null;
  }

  if (program && program.enrolments) {
    flagActive = program.enrolments.some(isActive);
    flagExited = program.enrolments.some(isExited);
  }

  return (
    <Fragment>
      <StyledPaper>
        {subjectVoided && <SubjectVoided showUnVoid={false} />}
        <StyledProgramBar>
          <Grid container spacing={1}>
            {flagActive && (
              <Fragment>
                <Program type="active" program={program} selectedTab={selectedTab} handleTabChange={handleTabChange} />
                <StyledGridSpacer />
              </Fragment>
            )}
            {flagExited && (
              <Program type="exited" program={program} selectedTab={selectedTabExited} handleTabChange={handleTabChangeExited} />
            )}
            {!(program && program.enrolments) && (
              <StyledTypographyNoEnrolments component="span">{t("notEnroledInAnyProgram")}</StyledTypographyNoEnrolments>
            )}
          </Grid>
        </StyledProgramBar>
        {selectedTab !== false ? (
          <ProgramDetails
            tabPanelValue={selectedTab}
            programData={program}
            handleUpdateComponent={handleUpdateComponent}
            subjectTypeUuid={subjectTypeUuid}
            subjectVoided={subjectVoided}
          />
        ) : (
          <ProgramDetails
            tabPanelValue={selectedTabExited}
            programData={program}
            handleUpdateComponent={handleUpdateComponent}
            subjectTypeUuid={subjectTypeUuid}
            subjectVoided={subjectVoided}
          />
        )}
      </StyledPaper>
    </Fragment>
  );
};

export default SubjectDashboardProgramTab;
