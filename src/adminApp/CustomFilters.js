import { useEffect, useState, useMemo } from "react";
import { styled } from "@mui/material/styles";
import _, { isEmpty } from "lodash";
import { httpClient as http } from "common/utils/httpClient";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { Title } from "react-admin";
import { default as UUID } from "uuid";
import { Box, Grid, Paper, Button, IconButton } from "@mui/material";
import { connect } from "react-redux";
import { getOperationalModules } from "../reports/reducers";
import { withRouter } from "react-router-dom";
import commonApi from "../common/service";
import { Privilege } from "openchs-models";
import UserInfo from "../common/model/UserInfo";
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/DeleteOutline";

export const omitTableData = filters => _.map(filters, f => _.omit(f, ["tableData", "Scope", "Filter Type", "Subject"]));

const StyledPaper = styled(Paper)(({ theme }) => ({
  boxShadow: theme.shadows[2],
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  display: "flex",
  flexDirection: "column"
}));

const StyledButtonContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1)
}));

function hasEditPrivilege(userInfo) {
  return UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.EditOfflineDashboardAndReportCard);
}

const CustomFilters = ({ history, operationalModules, getOperationalModules, organisation, filename, userInfo }) => {
  const typeOfFilter = history.location.pathname.endsWith("myDashboardFilters") ? "myDashboardFilters" : "searchFilters";

  useEffect(() => {
    getOperationalModules();
  }, [getOperationalModules]);

  const emptyOrgSettings = {
    uuid: UUID.v4(),
    settings: { languages: [], myDashboardFilters: [], searchFilters: [] },
    worklistUpdationRule: ""
  };

  const [settings, setSettings] = useState(emptyOrgSettings);
  const [worklistUpdationRule, setWorklistUpdationRule] = useState("");
  const [subjectTypes, setSubjectTypes] = useState(null);

  const createOrgSettings = setting => {
    const { uuid, settings } = setting;
    const { languages, myDashboardFilters, searchFilters } = settings;
    return {
      uuid,
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
        setWorklistUpdationRule(res.data._embedded.organisationConfig[0].worklistUpdationRule || "");
    });
  }, [organisation.id]);

  useEffect(() => {
    const fetchSubjectTypes = async () => setSubjectTypes(await commonApi.fetchSubjectTypes());
    fetchSubjectTypes();
  }, []);

  const columns = useMemo(
    () => [
      {
        accessorKey: "titleKey",
        header: "Task Assignment Filter Name",
        enableSorting: true,
        enableColumnFilter: true
      },
      {
        accessorKey: "conceptName",
        header: "Concept Name",
        enableSorting: true,
        enableColumnFilter: true
      },
      {
        id: "Subject",
        header: "Subject Type",
        accessorFn: row => {
          const subject = _.head(subjectTypes?.filter(s => s.uuid === row.subjectTypeUUID));
          return (subject && subject.name) || "";
        },
        enableSorting: true,
        enableColumnFilter: true,
        Cell: ({ row }) => {
          const subject = _.head(subjectTypes?.filter(s => s.uuid === row.original.subjectTypeUUID));
          return (subject && subject.name) || "";
        }
      },
      {
        id: "Filter Type",
        header: "Filter Type",
        accessorFn: row => _.startCase(row.type),
        enableSorting: true,
        enableColumnFilter: true,
        Cell: ({ row }) => _.startCase(row.original.type)
      },
      {
        id: "Widget",
        header: "Widget",
        accessorFn: row => row.widget || "Default",
        enableSorting: true,
        enableColumnFilter: true,
        Cell: ({ row }) => row.original.widget || "Default"
      },
      {
        id: "Scope",
        header: "Search Scope",
        accessorFn: row => _.startCase(row.scope),
        enableSorting: true,
        enableColumnFilter: true,
        Cell: ({ row }) => _.startCase(row.original.scope)
      }
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
    onClick: async row => {
      const voidedMessage = `Do you want to delete ${row.original.titleKey} filter?`;
      if (window.confirm(voidedMessage)) {
        const filteredFilters = omitTableData(settings.settings[filterType].filter(f => f.titleKey !== row.original.titleKey));
        const newSettings = {
          uuid: settings.uuid,
          settings: {
            languages: settings.settings.languages,
            myDashboardFilters: filterType === "myDashboardFilters" ? filteredFilters : settings.settings.myDashboardFilters,
            searchFilters: filterType === "searchFilters" ? filteredFilters : settings.settings.searchFilters
          },
          worklistUpdationRule
        };
        const response = await http.put("/organisationConfig", newSettings);
        if (response.status === 200 || response.status === 201) {
          setSettings(newSettings);
        }
      }
    }
  });

  const table = useMaterialReactTable({
    columns,
    data: settings.settings[typeOfFilter] || [],
    enablePagination: false,
    enableGlobalFilter: true,
    enableColumnFilters: true,
    enableSorting: true,
    enableTopToolbar: hasEditPrivilege(userInfo),
    enableRowActions: hasEditPrivilege(userInfo),
    renderRowActions: ({ row }) => (
      <StyledButtonContainer>
        {hasEditPrivilege(userInfo) && (
          <>
            <IconButton
              onClick={() => editFilter(typeOfFilter, `Edit ${_.startCase(typeOfFilter)}`).onClick(row)}
              title="Edit TaskAssignmentFilter"
            >
              <Edit />
            </IconButton>
            <IconButton onClick={() => deleteFilter(typeOfFilter).onClick(row)} title="Delete filter">
              <Delete />
            </IconButton>
          </>
        )}
      </StyledButtonContainer>
    ),
    muiTableHeadCellProps: {
      sx: { zIndex: 1 }
    },
    muiTableBodyCellProps: {
      sx: { "& .MuiIconButton-root": { color: "text.primary" } }
    }
  });

  if (subjectTypes === null) return <div />;

  return (
    <StyledPaper>
      <Title title={typeOfFilter === "myDashboardFilters" ? "My Dashboard Filters" : "Search Filters"} />
      <Grid container sx={{ justifyContent: "flex-end", mb: 2 }}>
        {hasEditPrivilege(userInfo) && (
          <Grid item>
            <StyledButtonContainer>
              <Button
                color="primary"
                variant="outlined"
                onClick={() => {
                  history.push({
                    pathname: "/appdesigner/filters",
                    state: {
                      filterType: typeOfFilter,
                      selectedFilter: null,
                      settings,
                      omitTableData,
                      operationalModules,
                      title: `Add ${_.startCase(typeOfFilter)}`,
                      worklistUpdationRule,
                      filename
                    }
                  });
                }}
              >
                NEW {_.startCase(typeOfFilter)}
              </Button>
            </StyledButtonContainer>
          </Grid>
        )}
      </Grid>
      <MaterialReactTable table={table} />
    </StyledPaper>
  );
};

const mapStateToProps = state => ({
  operationalModules: state.reports.operationalModules,
  userInfo: state.app.userInfo
});

export default withRouter(
  connect(
    mapStateToProps,
    { getOperationalModules }
  )(CustomFilters)
);
