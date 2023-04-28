import React from "react";
import { ShowLabelValue } from "../../common/ShowLabelValue";
import ResourceShowView from "../../common/ResourceShowView";
import FormLabel from "@material-ui/core/FormLabel";
import ShowDashboardSections from "./ShowDashboardSections";
import ShowDashboardFilters from "./ShowDashboardFilters";
import { connect } from "react-redux";
import { getOperationalModules } from "../../../reports/reducers";
import { withRouter } from "react-router-dom";
import DashboardService from "../../../common/service/DashboardService";

function render(dashboard, operationalModules) {
  return (
    <div>
      <ShowLabelValue label={"Name"} value={dashboard.name} />
      <p />
      <ShowLabelValue label={"Description"} value={dashboard.description} />
      <p />
      <FormLabel style={{ fontSize: "13px" }}>{"Sections"}</FormLabel>
      <br />
      <ShowDashboardSections sections={dashboard.sections} />
      <br />
      <FormLabel style={{ fontSize: "13px" }}>{"Filters"}</FormLabel>
      <br />
      <ShowDashboardFilters filters={dashboard.filters} operationalModules={operationalModules} />
    </div>
  );
}

const DashboardShow = props => {
  React.useEffect(() => {
    getOperationalModules();
  }, []);

  const { operationalModules } = props;

  return (
    <ResourceShowView
      title={"Offline Dashboard"}
      resourceId={props.match.params.id}
      resourceName={"dashboard"}
      resourceURLName={"dashboard"}
      render={dashboard => render(dashboard, operationalModules)}
      mapResource={resource =>
        DashboardService.mapDashboardFromResource(resource, operationalModules)
      }
    />
  );
};

const mapStateToProps = state => ({
  operationalModules: state.reports.operationalModules
});

export default withRouter(
  connect(
    mapStateToProps,
    { getOperationalModules }
  )(DashboardShow)
);
