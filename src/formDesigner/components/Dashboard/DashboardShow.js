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
import OperationalModules from "../../../common/model/OperationalModules";
import { Privilege } from "openchs-models";

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
    props.getOperationalModules();
  }, []);

  const { operationalModules } = props;

  if (!OperationalModules.isLoaded(operationalModules)) return null;

  return (
    <ResourceShowView
      operationalModules={operationalModules}
      title={"Offline Dashboard"}
      resourceId={props.match.params.id}
      resourceName={"dashboard"}
      resourceURLName={"dashboard"}
      render={dashboard => render(dashboard, operationalModules)}
      mapResource={resource =>
        DashboardService.mapDashboardFromResource(resource, operationalModules)
      }
      userInfo={props.userInfo}
      editPrivilegeType={Privilege.PrivilegeType.EditOfflineDashboardAndReportCard}
    />
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
  )(DashboardShow)
);
