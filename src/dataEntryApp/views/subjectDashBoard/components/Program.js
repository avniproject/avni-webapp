import React from "react";
import { styled } from "@mui/material/styles";
import { AppBar, Tabs, Tab, Grid } from "@mui/material";
import { useTranslation } from "react-i18next";

const StyledTabs = styled(Tabs, {
  shouldForwardProp: prop => !["type"].includes(prop)
})(({ type }) => ({
  minHeight: type === "active" ? "35px" : undefined,
  "& .MuiTabs-indicator": {
    display: "none"
  }
}));

const StyledTab = styled(Tab)({
  "&.Mui-selected": {
    backgroundColor: "#dae8fe",
    borderRight: "2px solid #1890ff",
    height: "35px"
  },
  color: "#2196f3",
  fontSize: "14px",
  minHeight: "35px",
  borderRight: "2px solid #1890ff",
  textTransform: "none"
});

const StyledGrid = styled(Grid, {
  shouldForwardProp: prop => !["type"].includes(prop)
})(({ type }) => ({
  ...(type === "active" && {
    maxWidth: "600px",
    marginTop: "14px",
    marginLeft: "20px",
    height: "18px"
  }),
  ...(type === "exited" && {
    maxWidth: "372px",
    marginTop: "14px",
    marginLeft: "25px"
  })
}));

const StyledLabel = styled("label", {
  shouldForwardProp: prop => !["type"].includes(prop)
})(({ type }) => ({
  fontSize: "12px",
  color: "#555555",
  fontWeight: "500"
}));

const StyledAppBar = styled(AppBar, {
  shouldForwardProp: prop => !["type"].includes(prop)
})(({ type }) => ({
  minHeight: type === "active" ? "35px" : undefined
}));

const Program = ({ type, program, selectedTab, handleTabChange }) => {
  const { t } = useTranslation();

  return (
    <StyledGrid type={type}>
      <StyledLabel type={type}>{t(type === "active" ? "activeprograms" : "exitedProgram")}</StyledLabel>
      <StyledAppBar position="static" color="default">
        <StyledTabs
          type={type}
          onChange={handleTabChange}
          value={selectedTab}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          aria-label="scrollable auto tabs example"
        >
          {program && program.enrolments
            ? program.enrolments.map((element, index) =>
              (element.programExitDateTime == null && type === "active") ||
              (element.programExitDateTime != null && type === "exited") ? (
                <StyledTab
                  id={element.program.operationalProgramName.replaceAll(" ", "-")}
                  key={index}
                  value={index}
                  label={t(element.program.operationalProgramName)}
                  disableRipple
                />
              ) : (
                ""
              )
            )
            : ""}
        </StyledTabs>
      </StyledAppBar>
    </StyledGrid>
  );
};

export default Program;