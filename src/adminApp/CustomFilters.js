import React, { Fragment, useEffect, useState, useMemo } from "react";
import { styled } from '@mui/material/styles';
import _, { isEmpty } from "lodash";
import http from "common/utils/httpClient";
import { MaterialReactTable } from "material-react-table";
import Paper from "@mui/material/Paper";
import { Title } from "react-admin";
import { default as UUID } from "uuid";
import Box from "@mui/material/Box";
import { connect } from "react-redux";
import { getOperationalModules } from "../reports/reducers";
import { withRouter } from "react-router-dom";
import Button from "@mui/material/Button";
import commonApi from "../common/service";
import { Privilege } from "openchs-models";
import UserInfo from "../common/model/UserInfo";
import { IconButton } from "@mui/material";
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/DeleteOutline";

const StyledPaper = styled(Paper)(({ theme }) => ({
  width: "100%",
  overflowX: "auto",
}));

const StyledBox = styled(Box)(({ theme }) => ({
  margin: theme.spacing(2),
}));

const StyledButtonContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
}));

const StyledTableHeadCell = styled(Box)(({ theme }) => ({
  zIndex: 1,
}));

function hasEditPrivilege(userInfo) {
  return UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.EditOfflineDashboardAndReportCard);
}

const CustomFilters = ({ operationalModules, getOperationalModules, history, organisation, filename, userInfo }) => {
  const typeOfFilter = history.location.pathname.endsWith("myDashboardFilters") ? "myDashboardFilters" : "searchFilters";

  useEffect(() => {
    getOperationalModules();
  }, []);

  const emptyOrgSettings = {
    uuid: UUID.v4(),
    settings: { languages: [], myDashboardFilters: [], searchFilters: [] },
    worklistUpdationRule: "",
  };

  const [settings, setSettings] = useState(emptyOrgSettings);
  const [worklistUpdationRule, setWorklistUpdationRule] = useState("");
  const [subjectTypes, setSubjectTypes] = useState(null);

  const createOrgSettings = setting => {
    const { uuid, settings } = setting;
    const { languages, myDashboardFilters, searchFilters } = settings;
    return {
      uuid: uuid,
      settings: {
        languages: _.isNil(languages) ? [] : languages,
        myDashboardFilters: _.isNil(myDashboardFilters) ? [] : myDashboardFilters,
        searchFilters: _.isNil(searchFilters) ? [] : searchFilters,
      },
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
  }, [organisation.id]);

  useEffect(() => {
    const fetchSubjectTypes = async () => setSubjectTypes(await commonApi.fetchSubjectTypes());
    fetchSubjectTypes();
    return () => {};
  }, []);

  const columns = useMemo(
    () => [
      {
        accessorKey: "titleKey",
        header: "TaskAssignmentFilter Name",
      },
      {
        accessorKey: "conceptName",
        header: "Concept Name",
      },
      {
        id: "Subject",
        header: "Subject Type",
        Cell: ({ row }) => {
          const subject = _.head(subjectTypes?.filter(s => s.uuid === row.original.subjectTypeUUID));
          return (subject && subject.name) || "";
        },
      },
      {
        id: "Filter Type",
        header: "Filter Type",
        Cell: ({ row }) => _.startCase(row.original.type),
      },
      {
        id: "widget",
        header: "Widget",
        Cell: ({ row }) => row.original.widget || "Default",
      },
      {
        id: "Scope",
        header: "Search Scope",
        Cell: ({ row }) => _.startCase(row.original.scope),
      },
    ],
    [subjectTypes]
  );

  const editFilter = (filterType, title) => ({
    onClick: row => {
      history.push({
        pathname: "/appdesigner/filters",
        state: {
          filterType,
          selectedFilter: row.original,
          settings,
          operationalModules,
          title,
          worklistUpdationRule,
          filename,
        },
      });
    },
  });

  const deleteFilter = filterType => ({
    onClick: async row => {
      const voidedMessage = `Do you want to delete ${row.original.titleKey} filter ?`;
      if (window.confirm(voidedMessage)) {
        const filteredFilters = settings.settings[filterType].filter(f => f.titleKey !== row.original.titleKey);
        const newSettings = {
          uuid: settings.uuid,
          settings: {
            languages: settings.settings.languages,
            myDashboardFilters: filterType === "myDashboardFilters" ? filteredFilters : settings.settings.myDashboardFilters,
            searchFilters: filterType === "searchFilters" ? filteredFilters : settings.settings.searchFilters,
          },
          worklistUpdationRule: worklistUpdationRule,
        };
        const response = await http.put("/organisationConfig", newSettings);
        if (response.status === 200 || response.status === 201) {
          setSettings(newSettings);
        }
      }
    },
  });

  const renderFilterTable = filterType => (
    <StyledBox>
      <MaterialReactTable
        columns={columns}
        data={settings.settings[filterType] || []}
        enablePagination={false}
        enableGlobalFilter={false}
        enableColumnFilters={false}
        enableTopToolbar={hasEditPrivilege(userInfo)}
        enableRowActions={hasEditPrivilege(userInfo)}
        renderTopToolbarCustomActions={() => (
          <StyledButtonContainer>
            {hasEditPrivilege(userInfo) && (
              <Button
                color="primary"
                variant="outlined"
                onClick={() => {
                  history.push({
                    pathname: "/appdesigner/filters",
                    state: {
                      filterType,
                      selectedFilter: null,
                      settings,
                      operationalModules,
                      title: `Add ${_.startCase(filterType)}`,
                      worklistUpdationRule,
                      filename,
                    },
                  });
                }}
              >
                NEW {_.startCase(filterType)}
              </Button>
            )}
          </StyledButtonContainer>
        )}
        renderRowActions={({ row }) => (
          <StyledButtonContainer>
            {hasEditPrivilege(userInfo) && (
              <>
                <IconButton
                  onClick={() => editFilter(filterType, `Edit ${_.startCase(filterType)}`).onClick(row)}
                  title="Edit TaskAssignmentFilter"
                >
                  <Edit />
                </IconButton>
                <IconButton onClick={() => deleteFilter(filterType).onClick(row)} title="Delete filter">
                  <Delete />
                </IconButton>
              </>
            )}
          </StyledButtonContainer>
        )}
        muiTableHeadCellProps={{
          sx: {
            zIndex: 1,
          },
        }}
      />
    </StyledBox>
  );

  return _.isNil(subjectTypes) ? (
    <div />
  ) : (
    <Fragment>
      {typeOfFilter === "myDashboardFilters" ? <Title title="My Dashboard Filters" /> : <Title title="Search Filters" />}
      <StyledPaper>
        <p />
        {renderFilterTable(typeOfFilter)}
      </StyledPaper>
    </Fragment>
  );
};

const mapStateToProps = state => ({
  operationalModules: state.reports.operationalModules,
  userInfo: state.app.userInfo,
});

export default withRouter(
  connect(
    mapStateToProps,
    { getOperationalModules }
  )(CustomFilters)
);