import { useEffect, useState, useMemo } from "react";
import { styled } from "@mui/material/styles";
import _, { isEmpty } from "lodash";
import { httpClient as http } from "common/utils/httpClient";
import {
  MaterialReactTable,
  useMaterialReactTable
} from "material-react-table";
import { Title } from "react-admin";
import { default as UUID } from "uuid";
import { Box, Grid, Paper, Button, IconButton } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { getOperationalModules } from "../reports/reducers";
import { useLocation, useNavigate } from "react-router-dom";
import commonApi from "../common/service";
import { Privilege } from "openchs-models";
import UserInfo from "../common/model/UserInfo";
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/DeleteOutline";

export const omitTableData = filters =>
  _.map(filters, f =>
    _.omit(f, ["tableData", "Scope", "Filter Type", "Subject"])
  );

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
  return UserInfo.hasPrivilege(
    userInfo,
    Privilege.PrivilegeType.EditOfflineDashboardAndReportCard
  );
}

const CustomFilters = ({ organisation, filename }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const operationalModules = useSelector(
    state => state.reports.operationalModules
  );
  const userInfo = useSelector(state => state.app.userInfo);

  const typeOfFilter = location.pathname.endsWith("myDashboardFilters")
    ? "myDashboardFilters"
    : "searchFilters";

  useEffect(() => {
    dispatch(getOperationalModules());
  }, [dispatch]);

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
        myDashboardFilters: _.isNil(myDashboardFilters)
          ? []
          : myDashboardFilters,
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
      const orgSettings = isEmpty(settings)
        ? emptyOrgSettings
        : createOrgSettings(settings[0]);
      setSettings(orgSettings);
      res.data._embedded.organisationConfig[0] &&
        setWorklistUpdationRule(
          res.data._embedded.organisationConfig[0].worklistUpdationRule || ""
        );
    });
  }, [organisation.id]);

  useEffect(() => {
    const fetchSubjectTypes = async () =>
      setSubjectTypes(await commonApi.fetchSubjectTypes());
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
          const subject = _.head(
            subjectTypes?.filter(s => s.uuid === row.subjectTypeUUID)
          );
          return (subject && subject.name) || "";
        },
        enableSorting: true,
        enableColumnFilter: true,
        Cell: ({ row }) => {
          const subject = _.head(
            subjectTypes?.filter(s => s.uuid === row.original.subjectTypeUUID)
          );
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
        accessorFn: row => _.startCase(row.widget),
        enableSorting: true,
        enableColumnFilter: true,
        Cell: ({ row }) => _.startCase(row.original.widget)
      },
      {
        id: "Scope",
        header: "Scope",
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
      navigate("/appdesigner/filters", {
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
    onClick: row => {
      if (window.confirm("Do you really want to delete the filter?")) {
        const filtersOfType = settings.settings[filterType];
        const updatedFilters = filtersOfType.filter(
          filter => filter.titleKey !== row.original.titleKey
        );
        const updatedSettings = {
          ...settings,
          settings: {
            ...settings.settings,
            [filterType]: updatedFilters
          }
        };
        setSettings(updatedSettings);

        http
          .put("/organisationConfig", updatedSettings)
          .then(response => {
            if (response.status === 200) {
              console.log("Filter deleted successfully");
            }
          })
          .catch(error => {
            console.error("Failed to delete filter:", error);
            alert("Failed to delete filter. Please try again.");
          });
      }
    }
  });

  const actions = useMemo(
    () =>
      hasEditPrivilege(userInfo)
        ? [
            {
              icon: Edit,
              tooltip: `Edit ${_.startCase(typeOfFilter)}`,
              ...editFilter(typeOfFilter, `Edit ${_.startCase(typeOfFilter)}`)
            },
            {
              icon: Delete,
              tooltip: `Delete ${_.startCase(typeOfFilter)}`,
              ...deleteFilter(typeOfFilter)
            }
          ]
        : [],
    [
      userInfo,
      typeOfFilter,
      settings,
      operationalModules,
      worklistUpdationRule,
      filename
    ]
  );

  const table = useMaterialReactTable({
    columns,
    data: settings.settings[typeOfFilter] || [],
    enableRowActions: hasEditPrivilege(userInfo),
    renderRowActions: ({ row, table }) => (
      <StyledButtonContainer>
        {actions.map((action, index) => (
          <IconButton
            key={index}
            onClick={() => action.onClick(row)}
            title={action.tooltip}
            size="small"
          >
            <action.icon />
          </IconButton>
        ))}
      </StyledButtonContainer>
    ),
    muiTableBodyRowProps: {
      hover: true
    },
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        borderRadius: "0"
      }
    }
  });

  return (
    <StyledPaper>
      <Title title={`${_.startCase(typeOfFilter)}`} />
      <Grid container sx={{ justifyContent: "flex-end", mb: 2 }}>
        {hasEditPrivilege(userInfo) && (
          <Grid>
            <Button
              color="primary"
              variant="outlined"
              onClick={() => {
                navigate("/appdesigner/filters", {
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
          </Grid>
        )}
      </Grid>
      <MaterialReactTable table={table} />
    </StyledPaper>
  );
};

export default CustomFilters;
