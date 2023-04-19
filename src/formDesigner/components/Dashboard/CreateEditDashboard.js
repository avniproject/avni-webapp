import React from "react";
import { DashboardReducer } from "./DashboardReducer";
import http from "../../../common/utils/httpClient";
import { get, isEmpty, isNil, find } from "lodash";
import { DocumentationContainer } from "../../../common/components/DocumentationContainer";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import VisibilityIcon from "@material-ui/icons/Visibility";
import { AvniTextField } from "../../../common/components/AvniTextField";
import { AvniFormLabel } from "../../../common/components/AvniFormLabel";
import { SaveComponent } from "../../../common/components/SaveComponent";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import DeleteIcon from "@material-ui/icons/Delete";
import { Redirect, withRouter } from "react-router-dom";
import CreateEditDashboardSections from "./CreateEditDashboardSections";
import { getErrorByKey } from "../../common/ErrorUtil";
import { getOperationalModules } from "../../../reports/reducers";
import { connect } from "react-redux";
import ShowDashboardFilters from "./ShowDashboardFilters";
import { CreateEditFilterDialog } from "./CreateEditFilterDialog";

const initialState = { name: "", description: "", sections: [], filters: [] };
const CreateEditDashboard = ({
  edit,
  history,
  operationalModules,
  getOperationalModules,
  ...props
}) => {
  const [dashboard, dispatch] = React.useReducer(DashboardReducer, initialState);
  const [error, setError] = React.useState([]);
  const [id, setId] = React.useState();
  const [redirectAfterDelete, setRedirectAfterDelete] = React.useState(false);
  const [showAddFilterModal, setShowAddFilterModal] = React.useState(false);
  const [selectedFilter, setSelectedFilter] = React.useState(null);
  React.useEffect(() => {
    getOperationalModules();
  }, []);

  React.useEffect(() => {
    selectedFilter && setShowAddFilterModal(true);
  }, [selectedFilter]);

  React.useEffect(() => {
    if (edit) {
      http
        .get(`/web/dashboard/${props.match.params.id}`)
        .then(res => res.data)
        .then(res => {
          dispatch({ type: "setData", payload: res });
        });
    }
  }, []);

  const isValidRequest = () => {
    const { name, sections } = dashboard;
    const errors = [];
    if (isEmpty(name)) {
      errors.push({ key: "EMPTY_NAME", message: "Name cannot be empty" });
    }
    if (isEmpty(sections)) {
      errors.push({ key: "EMPTY_SECTIONS", message: "Sections cannot be empty" });
    }
    if (!!find(sections, ({ name }) => isEmpty(name))) {
      errors.push({
        key: "EMPTY_SECTIONS",
        message: "Section name cannot be left blank. Please specify it for all sections."
      });
    }
    if (!!find(sections, ({ viewType }) => isEmpty(viewType))) {
      errors.push({
        key: "EMPTY_SECTIONS",
        message: "Section view type cannot be blank. Please select a view type"
      });
    }
    if (!!find(sections, ({ cards }) => isEmpty(cards))) {
      errors.push({ key: "EMPTY_SECTIONS", message: "Please add cards to the section." });
    }
    if (errors.length > 0) {
      setError(errors);
      return false;
    }
    return true;
  };

  const onSave = () => {
    if (isValidRequest()) {
      const url = edit ? `/web/dashboard/${props.match.params.id}` : "/web/dashboard";
      const methodName = edit ? "put" : "post";
      http[methodName](url, dashboard)
        .then(res => {
          if (res.status === 200) {
            setId(res.data.id);
          }
        })
        .catch(error => {
          setError([
            {
              key: "SERVER_ERROR",
              message: `${get(error, "response.data") ||
                get(error, "message") ||
                "error while saving dashboard"}`
            }
          ]);
        });
    }
  };

  const addSection = event => {
    setError(error.filter(({ key }) => key !== "EMPTY_SECTIONS"));
    dispatch({ type: "addSection" });
    event.stopPropagation();
  };

  const showFilterDialog = event => {
    setShowAddFilterModal(true);
    event.stopPropagation();
  };

  const onDelete = () => {
    if (window.confirm("Do you really want to delete dashboard record?")) {
      http
        .delete(`/web/dashboard/${props.match.params.id}`)
        .then(response => {
          if (response.status === 200) {
            setRedirectAfterDelete(true);
          }
        })
        .catch(error => console.error(error));
    }
  };

  const onChange = (type, event, errorKey) => {
    setError(error.filter(({ key }) => key !== errorKey));
    dispatch({ type: type, payload: event.target.value });
  };

  const handleModalClose = () => {
    setShowAddFilterModal(false);
  };

  return (
    <Box boxShadow={2} p={3} bgcolor="background.paper">
      <Title title={"Create Offline Dashboard"} />
      <DocumentationContainer filename={"Dashboard.md"}>
        {edit && (
          <Grid container style={{ justifyContent: "flex-end" }}>
            <Button color="primary" type="button" onClick={() => setId(props.match.params.id)}>
              <VisibilityIcon /> Show
            </Button>
          </Grid>
        )}
        <AvniTextField
          multiline
          id="name"
          label="Dashboard Name*"
          autoComplete="off"
          value={dashboard.name}
          onChange={event => onChange("name", event, "EMPTY_NAME")}
          toolTipKey={"APP_DESIGNER_DASHBOARD_NAME"}
        />
        {getErrorByKey(error, "EMPTY_NAME")}
        <p />
        <AvniTextField
          multiline
          id="description"
          label="Dashboard Description"
          autoComplete="off"
          value={dashboard.description}
          onChange={event => dispatch({ type: "description", payload: event.target.value })}
          toolTipKey={"APP_DESIGNER_DASHBOARD_DESCRIPTION"}
        />
        <br />
        <br />
        <Grid container>
          <Grid item container sm={6} justifyContent={"flex-start"}>
            <AvniFormLabel label={"Sections"} toolTipKey={"APP_DESIGNER_DASHBOARD_SECTIONS"} />
          </Grid>
          <Grid item container sm={6} justifyContent={"flex-end"}>
            <Button color="primary" onClick={addSection}>
              Add Section
            </Button>
          </Grid>
          {getErrorByKey(error, "EMPTY_SECTIONS")}
        </Grid>
        <Grid item>
          <CreateEditDashboardSections
            sections={dashboard.sections}
            dispatch={dispatch}
            history={history}
            error={error}
          />
        </Grid>
        {getErrorByKey(error, "EMPTY_CARDS")}
        <br />
        <CreateEditFilterDialog
          showAddFilterModal={showAddFilterModal}
          handleModalClose={handleModalClose}
          selectedFilter={selectedFilter}
          operationalModules={operationalModules}
          dashboardDispatch={dispatch}
          dashboard={dashboard}
          setShowAddFilterModal={setShowAddFilterModal}
        />
        <Grid container>
          <Grid item container sm={6} justifyContent={"flex-start"}>
            <AvniFormLabel label={"Filters"} toolTipKey={"APP_DESIGNER_DASHBOARD_FILTERS"} />
          </Grid>
          <Grid item container sm={6} justifyContent={"flex-end"}>
            <Button color="primary" onClick={showFilterDialog}>
              Add Filter
            </Button>
          </Grid>
        </Grid>
        <Grid item>
          <ShowDashboardFilters
            filters={dashboard.filters}
            editAction={filter => {
              setSelectedFilter(filter);
            }}
            deleteAction={selectedFilter =>
              dispatch({
                type: "deleteFilter",
                payload: { selectedFilter }
              })
            }
          />
        </Grid>
        <p />
        {getErrorByKey(error, "SERVER_ERROR")}
        <Grid container direction={"row"}>
          <Grid item xs={1}>
            <SaveComponent name="save" onSubmit={onSave} />
          </Grid>
          <Grid item xs={11}>
            {edit && (
              <Button style={{ float: "right", color: "red" }} onClick={onDelete}>
                <DeleteIcon /> Delete
              </Button>
            )}
          </Grid>
        </Grid>
        {!isNil(id) && <Redirect to={`/appDesigner/dashboard/${id}/show`} />}
        {redirectAfterDelete && <Redirect to="/appDesigner/dashboard" />}
      </DocumentationContainer>
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
  )(CreateEditDashboard)
);
