import { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import { localeChoices } from "../common/constants";
import { isEmpty } from "lodash";
import { httpClient as http } from "common/utils/httpClient";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import { Add, Edit } from "@mui/icons-material";
import { Title } from "react-admin";
import { default as UUID } from "uuid";
import Box from "@mui/material/Box";
import { connect } from "react-redux";
import { getOperationalModules } from "../reports/reducers";
import { withRouter } from "react-router-dom";
import commonApi from "../common/service";

const StyledPaper = styled(Paper)({
  width: "100%",
  overflowX: "auto"
});

const StyledTypography = styled("h6")({
  marginLeft: 20
});

const StyledBox = styled(Box)(({ theme }) => ({
  marginLeft: theme.spacing(2),
  marginRight: theme.spacing(2),
  borderBottom: 1,
  borderColor: "#e0e0e0"
}));

const StyledSpan = styled("span")({
  marginLeft: 20
});

const OrganisationConfig = ({ getOperationalModules, history, organisation, hasEditPrivilege }) => {
  useEffect(() => {
    getOperationalModules();
  }, []);

  const emptyOrgSettings = {
    uuid: UUID.v4(),
    settings: { languages: [], myDashboardFilters: [], searchFilters: [] },
    worklistUpdationRule: ""
  };

  const [settings, setSettings] = useState(emptyOrgSettings);
  const [worklistUpdationRule, setWorklistUpdationRule] = useState("");

  const createOrgSettings = setting => {
    const { uuid, settings } = setting;
    const { languages, myDashboardFilters, searchFilters } = settings;
    return {
      uuid,
      settings: {
        languages: languages ?? [],
        myDashboardFilters: myDashboardFilters ?? [],
        searchFilters: searchFilters ?? []
      }
    };
  };

  useEffect(() => {
    http.get("/organisationConfig").then(res => {
      const settings = res.data["_embedded"].organisationConfig.filter(config => config.organisationId === organisation.id);
      const orgSettings = isEmpty(settings) ? emptyOrgSettings : createOrgSettings(settings[0]);
      setSettings(orgSettings);
      if (res.data["_embedded"].organisationConfig[0]) {
        setWorklistUpdationRule(res.data["_embedded"].organisationConfig[0].worklistUpdationRule || "");
      }
    });
  }, []);

  const [subjectTypes, setSubjectTypes] = useState();

  useEffect(() => {
    const fetchSubjectTypes = async () => setSubjectTypes(await commonApi.fetchSubjectTypes());
    fetchSubjectTypes();
    return () => {};
  }, []);

  const renderLanguage = languages =>
    localeChoices
      .filter(locale => languages.includes(locale.id))
      .map(locale => locale.name)
      .join(", ");

  const editLanguage = () => (
    <IconButton
      label="Edit"
      onClick={() =>
        history.push({
          pathname: "/admin/editLanguages",
          state: { settings, worklistUpdationRule }
        })
      }
      size="large"
    >
      {isEmpty(settings.settings.languages) ? <Add /> : <Edit />}
    </IconButton>
  );

  return subjectTypes == null ? null : (
    <Box>
      <Title title="Languages" />
      <StyledPaper>
        <p />
        <StyledBox>
          <StyledTypography className="MuiTypography-root MuiTypography-h6">Languages</StyledTypography>
          <Box>
            {hasEditPrivilege ? editLanguage() : <StyledSpan />}
            {renderLanguage(settings.settings.languages)}
          </Box>
        </StyledBox>
        <p />
      </StyledPaper>
    </Box>
  );
};

const mapStateToProps = state => ({
  operationalModules: state.reports.operationalModules
});

export default withRouter(
  connect(
    mapStateToProps,
    { getOperationalModules }
  )(OrganisationConfig)
);
