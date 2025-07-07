import { useEffect, useRef, useState, useMemo } from "react";
import { MaterialReactTable } from "material-react-table";
import Select from "react-select";
import { Button, Grid, Checkbox, Typography, IconButton } from "@mui/material";
import api from "../api";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { getAllDashboards, getGroupDashboards } from "../reducers";
import { RadioButtonChecked, RadioButtonUnchecked, Delete } from "@mui/icons-material";

function handleResponse(response, groupId, refresh) {
  const [, error] = response;
  if (error) {
    alert(error);
  } else {
    refresh(groupId);
  }
}

function addDashboardToGroupHandler(event, dashboardsToBeAdded, groupId, refresh, setDashboardsToBeAdded, setButtonDisabled) {
  event.preventDefault();
  api.addDashboardsToGroup(dashboardsToBeAdded.map(dashboard => ({ dashboardId: dashboard.value, groupId: +groupId }))).then(response => {
    handleResponse(response, groupId, refresh);
    setDashboardsToBeAdded([]);
    setButtonDisabled(true);
  });
}

function removeDashboardFromGroupHandler(rowData, groupId, refresh) {
  api.removeDashboardFromGroup(rowData.id).then(response => handleResponse(response, groupId, refresh));
}

function setDashboardType({ id, groupId, dashboardId, primaryDashboard, secondaryDashboard }, refresh) {
  api
    .updateGroupDashboard(id, groupId, dashboardId, primaryDashboard, secondaryDashboard)
    .then(response => handleResponse(response, groupId, refresh));
}

const GroupDashboards = ({ getGroupDashboards, getAllDashboards, groupId, allDashboards, groupDashboards, ...props }) => {
  const [otherDashboards, setOtherDashboards] = useState([]);
  const [otherDashboardsOptions, setOtherDashboardsOptions] = useState([]);
  const otherDashboardsOptionsRef = useRef(null);
  const [dashboardsToBeAdded, setDashboardsToBeAdded] = useState([]);
  const [buttonDisabled, setButtonDisabled] = useState(true);

  useEffect(() => {
    getGroupDashboards(groupId);
    getAllDashboards();
  }, [getGroupDashboards, getAllDashboards, groupId]);

  useEffect(() => {
    if (allDashboards && groupDashboards) {
      setOtherDashboards(
        allDashboards.filter(dashboard => !groupDashboards.map(groupDashboard => groupDashboard.dashboardId).includes(dashboard.id))
      );
    }
  }, [allDashboards, groupDashboards]);

  useEffect(() => {
    setOtherDashboardsOptions(
      otherDashboards.map(otherDashboard => ({
        label: otherDashboard.name,
        value: otherDashboard.id
      }))
    );
  }, [otherDashboards]);

  const onDashboardListChange = event => {
    setDashboardsToBeAdded(event || []);
    setButtonDisabled(!event || event.length === 0);
  };

  const selectStyles = {
    menu: provided => ({
      ...provided,
      zIndex: 10000
    })
  };

  const columns = useMemo(
    () => [
      { accessorKey: "dashboardName", header: "Name", enableGlobalFilter: true },
      { accessorKey: "dashboardDescription", header: "Description", enableGlobalFilter: true },
      {
        accessorKey: "primaryDashboard",
        header: "Is Primary",
        enableGlobalFilter: false,
        Cell: ({ row }) => (
          <Checkbox
            icon={<RadioButtonUnchecked />}
            checkedIcon={<RadioButtonChecked />}
            checked={!!row.original.primaryDashboard}
            onChange={e => setDashboardType({ ...row.original, primaryDashboard: e.target.checked }, getGroupDashboards)}
          />
        )
      },
      {
        accessorKey: "secondaryDashboard",
        header: "Is Secondary",
        enableGlobalFilter: false,
        Cell: ({ row }) => (
          <Checkbox
            icon={<RadioButtonUnchecked />}
            checkedIcon={<RadioButtonChecked />}
            checked={!!row.original.secondaryDashboard}
            onChange={e => setDashboardType({ ...row.original, secondaryDashboard: e.target.checked }, getGroupDashboards)}
          />
        )
      },
      {
        id: "actions",
        header: "Remove",
        enableSorting: false,
        enableGlobalFilter: false,
        Cell: ({ row }) => (
          <IconButton
            title="Remove dashboard from group"
            onClick={() => removeDashboardFromGroupHandler(row.original, groupId, getGroupDashboards)}
          >
            <Delete />
          </IconButton>
        )
      }
    ],
    []
  );

  return (
    <div style={{ width: "100%" }}>
      <h6>Select dashboards to add to this group:</h6>
      <Grid container spacing={2} style={{ width: "100%" }}>
        <Grid size={10}>
          <Select
            name="addDashboardList"
            ref={otherDashboardsOptionsRef}
            isMulti
            isSearchable
            options={otherDashboardsOptions}
            onChange={onDashboardListChange}
            value={dashboardsToBeAdded}
            styles={selectStyles}
          />
        </Grid>
        <Grid size={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={event =>
              addDashboardToGroupHandler(event, dashboardsToBeAdded, groupId, getGroupDashboards, setDashboardsToBeAdded, setButtonDisabled)
            }
            disabled={buttonDisabled}
            fullWidth
          >
            Add dashboard(s)
          </Button>
        </Grid>
      </Grid>
      <br />
      <hr />
      <Typography variant="h6">Group Dashboards</Typography>
      <MaterialReactTable
        columns={columns}
        data={groupDashboards || []}
        enableGlobalFilter
        enableColumnFilters={false}
        enableSorting
        muiTableHeadCellProps={{
          sx: { zIndex: 0 }
        }}
        muiSearchTextFieldProps={{
          sx: { float: "left" }
        }}
      />
    </div>
  );
};

const mapStateToProps = state => ({
  groupDashboards: state.userGroups.groupDashboards,
  allDashboards: state.userGroups.allDashboards
});

export default withRouter(
  connect(
    mapStateToProps,
    { getGroupDashboards, getAllDashboards }
  )(GroupDashboards)
);
