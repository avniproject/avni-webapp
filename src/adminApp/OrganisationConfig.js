import React, { useEffect, useState } from "react";
import { localeChoices } from "../common/constants";
import _, { isEmpty } from "lodash";
import http from "common/utils/httpClient";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import { Add, Edit } from "@material-ui/icons";
import { Title } from "react-admin";
import { default as UUID } from "uuid";
import Box from "@material-ui/core/Box";
import { connect } from "react-redux";
import { getOperationalModules } from "../reports/reducers";
import { withRouter } from "react-router-dom";

const useStyles = makeStyles({
  root: {
    width: "100%",
    overflowX: "auto"
  }
});

const customConfig = ({ operationalModules, getOperationalModules, history, organisation }) => {
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
      const settings = _.filter(
        res.data["_embedded"].organisationConfig,
        config => config.organisationId === organisation.id
      );
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
    http.get("/subjectType").then(res => {
      res.data && setSubjectTypes(res.data._embedded.subjectType);
    });
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
            {editLanguage()}
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
  )(customConfig)
);
