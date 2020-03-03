import React, { Fragment, useEffect, useState } from "react";
import { localeChoices } from "../common/constants";
import _, { isEmpty } from "lodash";
import http from "common/utils/httpClient";
import MaterialTable from "material-table";
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
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import SaveIcon from "@material-ui/icons/Save";

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
  const [worklistUpdationRuleExpand, setWorklistUpdationRuleExpand] = useState(false);
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
        res.data._embedded.organisationConfig,
        config => config.organisationId === organisation.id
      );
      const orgSettings = isEmpty(settings) ? emptyOrgSettings : createOrgSettings(settings[0]);
      setSettings(orgSettings);
      !_.isEmpty(res.data._embedded.organisationConfig) &&
        setWorklistUpdationRule(res.data._embedded.organisationConfig[0].worklistUpdationRule);
    });
  }, []);

  const [subjectTypes, setSubjectTypes] = React.useState();

  useEffect(() => {
    http.get("/subjectType").then(res => {
      res.data && setSubjectTypes(res.data._embedded.subjectType);
    });
  }, []);

  const styles = useStyles();

  const columns = [
    { title: "Filter Name", field: "titleKey" },
    { title: "Concept Name", field: "conceptName" },
    { title: "Subject Type", field: "Subject" },
    { title: "Filter Type", field: "Filter Type" },
    { title: "Widget", field: "widget" },
    { title: "Search Scope", field: "Scope" }
  ];

  const renderLanguage = languages => {
    return localeChoices
      .filter(locale => languages.includes(locale.id))
      .map(locale => `${locale.name}`)
      .join(", ");
  };

  const filterData = filters => {
    return _.map(filters, filter => {
      const subject = _.head(subjectTypes.filter(s => s.uuid === filter.subjectTypeUUID));
      filter["widget"] = filter["widget"] || "Default";
      filter["Scope"] = _.startCase(filter["scope"]);
      filter["Filter Type"] = _.startCase(filter["type"]);
      filter["Subject"] = (subject && subject.name) || "";
      return filter;
    });
  };

  const editFilter = (filterType, title) => ({
    icon: "edit",
    tooltip: "Edit Filter",
    onClick: (event, filter) => {
      history.push({
        pathname: "/admin/filters",
        state: {
          filterType,
          selectedFilter: filter,
          settings,
          omitTableData,
          operationalModules,
          title,
          worklistUpdationRule
        }
      });
    }
  });

  const omitTableData = filters =>
    _.map(filters, filter => _.omit(filter, ["tableData", "Scope", "Filter Type", "Subject"]));

  const deleteFilter = filterType => ({
    icon: "delete_outline",
    onClick: (event, rowData) => {
      const voidedMessage = `Do you want to delete ${rowData.titleKey} filter ?`;
      if (window.confirm(voidedMessage)) {
        const filteredFilters = omitTableData(
          settings.settings[filterType].filter(f => f.titleKey !== rowData.titleKey)
        );
        const newSettings = {
          uuid: settings.uuid,
          settings: {
            languages: settings.settings.languages,
            myDashboardFilters:
              filterType === "myDashboardFilters"
                ? filteredFilters
                : omitTableData(settings.settings.myDashboardFilters),
            searchFilters:
              filterType === "searchFilters"
                ? filteredFilters
                : omitTableData(settings.settings.searchFilters)
          },
          worklistUpdationRule: worklistUpdationRule
        };
        http.post("/organisationConfig", newSettings).then(response => {
          if (response.status === 201) {
            setSettings(newSettings);
          }
        });
      }
    }
  });

  const addFilter = (filterType, title) => ({
    icon: "add_outline",
    tooltip: "Add Filter",
    isFreeAction: true,
    onClick: event => {
      history.push({
        pathname: "/admin/filters",
        state: {
          filterType,
          selectedFilter: null,
          settings,
          omitTableData,
          operationalModules,
          title,
          worklistUpdationRule
        }
      });
    }
  });

  const editLanguage = () => (
    <IconButton
      label="Edit"
      onClick={() =>
        history.push({
          pathname: "/admin/languages",
          state: { settings, worklistUpdationRule }
        })
      }
    >
      {_.isEmpty(settings.settings.languages) ? <Add /> : <Edit />}
    </IconButton>
  );

  const renderFilterTable = filterType => (
    <Box m={2}>
      <MaterialTable
        title={_.startCase(filterType)}
        components={{
          Container: props => <Fragment>{props.children}</Fragment>
        }}
        columns={columns}
        data={filterData(settings.settings[filterType])}
        options={{ search: false, paging: false }}
        actions={[
          addFilter(filterType, `Add ${_.startCase(filterType)}`),
          deleteFilter(filterType),
          editFilter(filterType, `Edit ${_.startCase(filterType)}`)
        ]}
      />
    </Box>
  );

  const onSaveWorklistUpdationRule = event =>
    http
      .post("/organisationConfig", {
        uuid: settings.uuid,
        settings: settings.settings,
        worklistUpdationRule: worklistUpdationRule
      })
      .then(response => {
        if (response.status === 201) {
          setWorklistUpdationRuleExpand(false);
        }
      });

  return _.isNil(subjectTypes) ? (
    <div />
  ) : (
    <Box>
      <Title title="Organisation Config" />
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
        {renderFilterTable("myDashboardFilters")}
        {renderFilterTable("searchFilters")}

        <ExpansionPanel expanded={worklistUpdationRuleExpand}>
          <ExpansionPanelSummary
            aria-controls="panel1a-content"
            id="panel1a-header"
            style={{ marginTop: "3%" }}
          >
            <Grid container item sm={12}>
              <Grid item sm={2}>
                <span onClick={event => setWorklistUpdationRuleExpand(!worklistUpdationRuleExpand)}>
                  {worklistUpdationRuleExpand ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </span>
                {/* </Grid>
            <Grid item sm={2}> */}

                <span style={{ fontSize: "1.25rem", fontFamily: "Roboto", fontWeight: "500" }}>
                  Worklist updation rule
                </span>
              </Grid>
              <Grid item sm={8} />

              <Grid item sm={2}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={event => onSaveWorklistUpdationRule(event)}
                  style={{
                    marginLeft: "60%"
                  }}
                  // disabled={!this.state.detectBrowserCloseEvent}
                >
                  <SaveIcon />
                  &nbsp;Save
                </Button>
              </Grid>
            </Grid>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Editor
              value={worklistUpdationRule ? worklistUpdationRule : ""}
              onValueChange={event => setWorklistUpdationRule(event)}
              highlight={code => highlight(code, languages.js)}
              padding={10}
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 15,
                width: "100%",
                height: "auto",
                borderStyle: "solid",
                borderWidth: "1px"
              }}
            />
          </ExpansionPanelDetails>
        </ExpansionPanel>
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
