import { useState, useEffect, useReducer } from "react";
import { DashboardReducer } from "./DashboardReducer";
import { httpClient as http } from "../../../common/utils/httpClient";
import { isEmpty, isNil, reject } from "lodash";
import { DocumentationContainer } from "../../../common/components/DocumentationContainer";
import { Grid } from "@mui/material";
import Button from "@mui/material/Button";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { AvniTextField } from "../../../common/components/AvniTextField";
import { AvniFormLabel } from "../../../common/components/AvniFormLabel";
import { SaveComponent } from "../../../common/components/SaveComponent";
import Box from "@mui/material/Box";
import { Title } from "react-admin";
import DeleteIcon from "@mui/icons-material/Delete";
import { Redirect, withRouter } from "react-router-dom";
import CreateEditDashboardSections from "./CreateEditDashboardSections";
import { createServerError, getErrorByKey } from "../../common/ErrorUtil";
import { getOperationalModules } from "../../../reports/reducers";
import { connect } from "react-redux";
import ShowDashboardFilters from "./ShowDashboardFilters";
import { CreateEditFilterDialog } from "./CreateEditFilterDialog";
import DashboardService from "../../../common/service/DashboardService";
import OperationalModules from "../../../common/model/OperationalModules";
import WebDashboard from "../../../common/model/reports/WebDashboard";

const CreateEditDashboard = ({ edit, history, operationalModules, getOperationalModules, ...props }) => {
  const [dashboard, dispatch] = useReducer(DashboardReducer, WebDashboard.createNew());
  const [error, setError] = useState([]);
  const [id, setId] = useState();
  const [redirectAfterDelete, setRedirectAfterDelete] = useState(false);
  const [showAddFilterModal, setShowAddFilterModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(null);
  useEffect(() => {
    getOperationalModules();
  }, []);

  useEffect(() => {
    selectedFilter && setShowAddFilterModal(true);
  }, [selectedFilter]);

  useEffect(() => {
    if (edit && OperationalModules.isLoaded(operationalModules)) {
      DashboardService.getDashboard(props.match.params.id, operationalModules).then(dashboard => {
        dispatch({ type: "setData", payload: dashboard });
      });
    }
  }, [operationalModules]);

  const addSection = event => {
    setError(error.filter(({ key }) => key !== "EMPTY_SECTIONS"));
    dispatch({ type: "addSection" });
    event.stopPropagation();
  };

  const showFilterDialog = event => {
    setSelectedFilter(null);
    setShowAddFilterModal(true);
    event.stopPropagation();
  };

  const onDelete = () => {
    if (window.confirm("Do you really want to delete dashboard record?")) {
      http.delete(`/web/dashboard/${props.match.params.id}`).then(response => {
        if (response.status === 200) {
          setRedirectAfterDelete(true);
        }
      });
    }
  };

  const onChange = (type, event, errorKey) => {
    setError(error.filter(({ key }) => key !== errorKey));
    dispatch({ type: type, payload: event.target.value });
  };

  const handleModalClose = () => {
    setShowAddFilterModal(false);
    setSelectedFilter(null);
  };

  const onSave = () => {
    const errors = DashboardService.validate(dashboard);
    if (!isEmpty(errors)) {
      setError(errors);
      return;
    }

    DashboardService.save(dashboard, edit, props.match.params.id)
      .then(data => setId(data.id))
      .catch(error => setError([createServerError(error, "error while saving dashboard")]));
  };

  if (!OperationalModules.isLoaded(operationalModules)) return null;

  const onFilterDelete = selectedFilter => {
    const errors = [];
    DashboardService.validateForMissingSubjectTypeFilter(reject(dashboard.filters, x => x.uuid === selectedFilter.uuid), errors);
    if (!isEmpty(errors)) {
      setError(errors);
      return;
    }
    dispatch({
      type: "deleteFilter",
      payload: { selectedFilter }
    });
  };

  return (
    <Box
      sx={{
        boxShadow: 2,
        p: 3,
        bgcolor: "background.paper"
      }}
    >
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
          style={{ width: "12em" }}
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
          <Grid
            container
            sx={{
              justifyContent: "flex-start"
            }}
            size={{
              sm: 6
            }}
          >
            <AvniFormLabel label={"Sections"} toolTipKey={"APP_DESIGNER_DASHBOARD_SECTIONS"} />
          </Grid>
          <Grid
            container
            sx={{
              justifyContent: "flex-end"
            }}
            size={{
              sm: 6
            }}
          >
            <Button color="primary" onClick={addSection}>
              Add Section
            </Button>
          </Grid>
          {getErrorByKey(error, "EMPTY_SECTIONS")}
        </Grid>
        <Grid>
          <CreateEditDashboardSections sections={WebDashboard.getSections(dashboard)} dispatch={dispatch} history={history} error={error} />
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
        <Grid container style={{ marginTop: 100 }}>
          <Grid
            container
            sx={{
              justifyContent: "flex-start"
            }}
            size={{
              sm: 6
            }}
          >
            <AvniFormLabel label={"Filters"} toolTipKey={"APP_DESIGNER_DASHBOARD_FILTERS"} />
          </Grid>
          <Grid
            container
            sx={{
              justifyContent: "flex-end"
            }}
            size={{
              sm: 6
            }}
          >
            <Button color="primary" onClick={showFilterDialog}>
              Add Filter
            </Button>
          </Grid>
        </Grid>
        <p />
        {getErrorByKey(error, "INCOMPATIBLE_FILTER_AND_CARD")}
        <Grid>
          <ShowDashboardFilters
            operationalModules={operationalModules}
            filters={dashboard.filters}
            editAction={filter => {
              setSelectedFilter(filter);
            }}
            deleteAction={onFilterDelete}
          />
        </Grid>
        <p />
        {getErrorByKey(error, "SERVER_ERROR")}
        {getErrorByKey(error, "MISSING_SUBJECT_TYPE_FILTER")}
        <Grid container direction={"row"}>
          <Grid size={1}>
            <SaveComponent name="save" onSubmit={onSave} />
          </Grid>
          <Grid size={11}>
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
