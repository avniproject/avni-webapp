import React from "react";
import MaterialTable from "material-table";
import Select from "react-select";
import Button from "@material-ui/core/Button";
import api from "../api";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { getAllDashboards, getGroupDashboards } from "../reducers";
import Grid from "@material-ui/core/Grid";
import Checkbox from "@material-ui/core/Checkbox";
import { RadioButtonChecked, RadioButtonUnchecked } from "@material-ui/icons";
import Delete from "@material-ui/icons/DeleteOutline";
import materialTableIcons from "../../common/material-table/MaterialTableIcons";

function handleResponse(response, groupId, refresh) {
  const [, error] = response;
  if (error) {
    alert(error);
  } else {
    refresh(groupId);
  }
}

function addDashboardToGroupHandler(event, otherDashboardsOptionsRef, dashboardsToBeAdded, groupId, refresh) {
  event.preventDefault();
  otherDashboardsOptionsRef.current.select.clearValue();

  api
    .addDashboardsToGroup(dashboardsToBeAdded.map(dashboard => ({ dashboardId: dashboard.value, groupId: +groupId })))
    .then(response => handleResponse(response, groupId, refresh));
}

function removeDashboardFromGroupHandler(event, rowData, groupId, refresh) {
  api.removeDashboardFromGroup(rowData.id).then(response => handleResponse(response, groupId, refresh));
}

function setDashboardType({ id, groupId, dashboardId, primaryDashboard, secondaryDashboard }, refresh) {
  api
    .updateGroupDashboard(id, groupId, dashboardId, primaryDashboard, secondaryDashboard)
    .then(response => handleResponse(response, groupId, refresh));
}

const GroupDashboards = ({ getGroupDashboards, getAllDashboards, groupId, allDashboards, groupDashboards, ...props }) => {
  const [otherDashboards, setOtherDashboards] = React.useState([]);
  const [otherDashboardsOptions, setOtherDashboardsOptions] = React.useState([]);
  const otherDashboardsOptionsRef = React.useRef(null);

  React.useEffect(() => {
    getGroupDashboards(groupId);
    getAllDashboards();
  }, []);

  React.useEffect(() => {
    if (allDashboards && groupDashboards) {
      setOtherDashboards(
        allDashboards.filter(dashboard => !groupDashboards.map(groupDashboard => groupDashboard.dashboardId).includes(dashboard.id))
      );
    }
  }, [allDashboards, groupDashboards]);

  React.useEffect(() => {
    setOtherDashboardsOptions(
      otherDashboards.map(otherDashboard => ({
        label: otherDashboard.name,
        value: otherDashboard.id
      }))
    );
  }, [otherDashboards]);

  const [dashboardsToBeAdded, setDashboardsToBeAdded] = React.useState([]);
  const [buttonDisabled, setButtonDisabled] = React.useState(true);

  const onDashboardListChange = event => {
    setDashboardsToBeAdded(event);
    event && event.length > 0 ? setButtonDisabled(false) : setButtonDisabled(true);
  };

  const columns = [
    { title: "Name", field: "dashboardName", searchable: true },
    { title: "Description", field: "dashboardDescription", searchable: true },
    {
      title: "Is Primary",
      field: "primaryDashboard",
      searchable: false,
      render: rowData => (
        <Checkbox
          icon={<RadioButtonUnchecked />}
          checkedIcon={<RadioButtonChecked />}
          checked={!!rowData.primaryDashboard}
          onChange={e => setDashboardType({ ...rowData, primaryDashboard: e.target.checked }, getGroupDashboards)}
        />
      )
    },
    {
      title: "Is Secondary",
      field: "secondaryDashboard",
      searchable: false,
      render: rowData => (
        <Checkbox
          icon={<RadioButtonUnchecked />}
          checkedIcon={<RadioButtonChecked />}
          checked={!!rowData.secondaryDashboard}
          onChange={e => setDashboardType({ ...rowData, secondaryDashboard: e.target.checked }, getGroupDashboards)}
        />
      )
    }
  ];
  return (
    <div style={{ width: "100%" }}>
      <h6>Select dashboards to add to this group:</h6>
      <Grid container spacing={2} style={{ width: "100%" }}>
        <Grid item xs={10}>
          <Select
            name="addDashboardList"
            ref={otherDashboardsOptionsRef}
            isMulti
            isSearchable
            options={otherDashboardsOptions}
            onChange={onDashboardListChange}
          />
        </Grid>
        <Grid item xs={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={event =>
              addDashboardToGroupHandler(event, otherDashboardsOptionsRef, dashboardsToBeAdded, groupId, getGroupDashboards)
            }
            disabled={buttonDisabled}
            fullWidth={true}
          >
            Add dashboard(s)
          </Button>
        </Grid>
      </Grid>
      <br />
      <hr />
      <MaterialTable
        icons={materialTableIcons}
        title="Group Dashboards"
        columns={columns}
        data={groupDashboards}
        actions={[
          rowData => ({
            icon: () => <Delete />,
            tooltip: "Remove dashboard from group",
            onClick: (event, rowData) => removeDashboardFromGroupHandler(event, rowData, groupId, getGroupDashboards)
          })
        ]}
        options={{
          actionsColumnIndex: 4,
          searchFieldAlignment: "left",
          headerStyle: {
            zIndex: 0
          }
        }}
        localization={{
          header: { actions: "Remove" }
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
