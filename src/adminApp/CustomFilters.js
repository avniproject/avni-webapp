import React, { Fragment, useEffect, useState } from "react";
import _, { isEmpty } from "lodash";
import http from "common/utils/httpClient";
import MaterialTable from "material-table";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import { Title } from "react-admin";
import { default as UUID } from "uuid";
import Box from "@material-ui/core/Box";
import { connect } from "react-redux";
import { getOperationalModules } from "../reports/reducers";
import { withRouter } from "react-router-dom";
import Button from "@material-ui/core/Button";
import commonApi from "../common/service";
import { Privilege } from "openchs-models";
import UserInfo from "../common/model/UserInfo";
import Edit from "@material-ui/icons/Edit";
import Delete from "@material-ui/icons/DeleteOutline";
import materialTableIcons from "../common/material-table/MaterialTableIcons";

function hasEditPrivilege(userInfo) {
  return UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.EditOfflineDashboardAndReportCard);
}

const useStyles = makeStyles({
  root: {
    width: "100%",
    overflowX: "auto"
  }
});

const customFilters = ({ operationalModules, getOperationalModules, history, organisation, filename, userInfo }) => {
  const typeOfFilter = history.location.pathname.endsWith("myDashboardFilters") ? "myDashboardFilters" : "searchFilters";
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
      const settings = _.filter(res.data._embedded.organisationConfig, config => config.organisationId === organisation.id);
      const orgSettings = isEmpty(settings) ? emptyOrgSettings : createOrgSettings(settings[0]);
      setSettings(orgSettings);
      res.data._embedded.organisationConfig[0] &&
        setWorklistUpdationRule(
          res.data._embedded.organisationConfig[0].worklistUpdationRule ? res.data._embedded.organisationConfig[0].worklistUpdationRule : ""
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

  const editFilter = (filterType, title) => ({
    icon: () => <Edit />,
    tooltip: "Edit TaskAssignmentFilter",
    onClick: (event, filter) => {
      history.push({
        pathname: "/appdesigner/filters",
        state: {
          filterType,
          selectedFilter: filter,
          settings,
          omitTableData,
          operationalModules,
          title,
          worklistUpdationRule,
          filename
        }
      });
    }
  });

  const deleteFilter = filterType => ({
    icon: () => <Delete />,
    tooltip: "Delete filter",
    onClick: (event, rowData) => {
      const voidedMessage = `Do you want to delete ${rowData.titleKey} filter ?`;
      if (window.confirm(voidedMessage)) {
        const filteredFilters = omitTableData(settings.settings[filterType].filter(f => f.titleKey !== rowData.titleKey));
        const newSettings = {
          uuid: settings.uuid,
          settings: {
            languages: settings.settings.languages,
            myDashboardFilters: filterType === "myDashboardFilters" ? filteredFilters : omitTableData(settings.settings.myDashboardFilters),
            searchFilters: filterType === "searchFilters" ? filteredFilters : omitTableData(settings.settings.searchFilters)
          },
          worklistUpdationRule: worklistUpdationRule
        };
        http.put("/organisationConfig", newSettings).then(response => {
          if (response.status === 200 || response.status === 201) {
            setSettings(newSettings);
          }
        });
      }
    }
  });

  const renderFilterTable = filterType => (
    <Box m={2}>
      {hasEditPrivilege(userInfo) && (
        <div style={{ float: "right", right: "50px", marginTop: "15px" }}>
          <Button
            color="primary"
            variant="outlined"
            onClick={event => {
              history.push({
                pathname: "/appdesigner/filters",
                state: {
                  filterType,
                  selectedFilter: null,
                  settings,
                  omitTableData,
                  operationalModules,
                  title: `Add ${_.startCase(filterType)}`,
                  worklistUpdationRule,
                  filename
                }
              });
            }}
          >
            NEW {_.startCase(filterType)}
          </Button>
        </div>
      )}
      <MaterialTable
        icons={materialTableIcons}
        title={_.startCase(filterType)}
        components={{
          Container: props => <Fragment>{props.children}</Fragment>
        }}
        columns={filterDisplayColumns}
        data={buildFilterData(settings.settings[filterType], subjectTypes)}
        options={{
          headerStyle: {
            zIndex: 1
          },
          search: false,
          paging: false
        }}
        actions={hasEditPrivilege(userInfo) && [editFilter(filterType, `Edit ${_.startCase(filterType)}`), deleteFilter(filterType)]}
      />
    </Box>
  );

  return _.isNil(subjectTypes) ? (
    <div />
  ) : (
    <Box>
      {typeOfFilter === "myDashboardFilters" ? <Title title="My Dashboard Filters" /> : <Title title="Search Filters" />}
      <Paper className={styles.root}>
        <p />
        {renderFilterTable(typeOfFilter)}
      </Paper>
    </Box>
  );
};
const mapStateToProps = state => ({
  operationalModules: state.reports.operationalModules,
  userInfo: state.app.userInfo
});

export const filterDisplayColumns = [
  { title: "TaskAssignmentFilter Name", field: "titleKey" },
  { title: "Concept Name", field: "conceptName" },
  { title: "Subject Type", field: "Subject" },
  { title: "Filter Type", field: "Filter Type" },
  { title: "Widget", field: "widget" },
  { title: "Search Scope", field: "Scope" }
];

export const buildFilterData = (filters, subjectTypes) => {
  return _.map(filters, filter => {
    const subject = _.head(subjectTypes.filter(s => s.uuid === filter.subjectTypeUUID));
    filter["widget"] = filter["widget"] || "Default";
    filter["Scope"] = _.startCase(filter["scope"]);
    filter["Filter Type"] = _.startCase(filter["type"]);
    filter["Subject"] = (subject && subject.name) || "";
    return filter;
  });
};

export const omitTableData = filters => _.map(filters, filter => _.omit(filter, ["tableData", "Scope", "Filter Type", "Subject"]));

export default withRouter(
  connect(
    mapStateToProps,
    { getOperationalModules }
  )(customFilters)
);
