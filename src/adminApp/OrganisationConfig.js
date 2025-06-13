import React, { useEffect, useState } from "react";
import { localeChoices } from "../common/constants";
import _, { isEmpty } from "lodash";
import http from "common/utils/httpClient";
import makeStyles from "@mui/styles/makeStyles";
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

const useStyles = makeStyles({
  root: {
    width: "100%",
    overflowX: "auto"
  }
});

const OrganisationConfig = ({ getOperationalModules, history, organisation, hasEditPrivilege }) => {
  React.useEffect(() => {
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
      uuid: uuid,
      settings: {
        languages: _.isNil(languages) ? [] : languages,
        myDashboardFilters: _.isNil(myDashboardFilters) ? [] : myDashboardFilters,
        searchFilters: _.isNil(searchFilters) ? [] : searchFilters
      }
    };
  };

  useEffect(() => {
    http.get("/organisationConfig").then(res => {
      const settings = _.filter(res.data["_embedded"].organisationConfig, config => config.organisationId === organisation.id);
      const orgSettings = isEmpty(settings) ? emptyOrgSettings : createOrgSettings(settings[0]);
      setSettings(orgSettings);
      res.data["_embedded"].organisationConfig[0] &&
        setWorklistUpdationRule(
          res.data["_embedded"].organisationConfig[0].worklistUpdationRule
            ? res.data["_embedded"].organisationConfig[0].worklistUpdationRule
            : ""
        );
    });
  }, []);

  const [subjectTypes, setSubjectTypes] = React.useState();

  useEffect(() => {
    const fetchSubjectTypes = async () => setSubjectTypes(await commonApi.fetchSubjectTypes());
    fetchSubjectTypes();
    return () => {};
  }, []);

  const styles = useStyles();

  const renderLanguage = languages => {
    return localeChoices
      .filter(locale => languages.includes(locale.id))
      .map(locale => `${locale.name}`)
      .join(", ");
  };

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
      {_.isEmpty(settings.settings.languages) ? <Add /> : <Edit />}
    </IconButton>
  );

  return _.isNil(subjectTypes) ? (
    <div />
  ) : (
    <Box>
      <Title title="Languages" />
      <Paper className={styles.root}>
        <p />
        <Box ml={2} mr={2} borderBottom={1} borderColor="#e0e0e0">
          <h6 className="MuiTypography-root MuiTypography-h6" style={{ marginLeft: 20 }}>
            Languages
          </h6>
          <Box>
            {hasEditPrivilege ? editLanguage() : <span style={{ marginLeft: 20 }} />}
            {renderLanguage(settings.settings.languages)}
          </Box>
        </Box>
        <p />
      </Paper>
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
