import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { ShowLabelValue } from "../../common/ShowLabelValue";
import ResourceShowView from "../../common/ResourceShowView";
import { FormLabel } from "@mui/material";
import ShowDashboardSections from "./ShowDashboardSections";
import ShowDashboardFilters from "./ShowDashboardFilters";
import { getOperationalModules } from "../../../reports/reducers";
import DashboardService from "../../../common/service/DashboardService";
import OperationalModules from "../../../common/model/OperationalModules";
import { Privilege } from "openchs-models";
import WebDashboard from "../../../common/model/reports/WebDashboard";

function render(dashboard, operationalModules) {
  return (
    <div>
      <ShowLabelValue label={"Name"} value={dashboard.name} />
      <p />
      <ShowLabelValue label={"Description"} value={dashboard.description} />
      <p />
      <FormLabel style={{ fontSize: "13px" }}>{"Sections"}</FormLabel>
      <br />
      <ShowDashboardSections sections={WebDashboard.getSections(dashboard)} />
      <br />
      <FormLabel style={{ fontSize: "13px" }}>{"Filters"}</FormLabel>
      <br />
      <ShowDashboardFilters filters={dashboard.filters} operationalModules={operationalModules} />
    </div>
  );
}

const DashboardShow = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const operationalModules = useSelector(state => state.reports.operationalModules);
  const userInfo = useSelector(state => state.app.userInfo);

  useEffect(() => {
    dispatch(getOperationalModules());
  }, [dispatch]);

  if (!OperationalModules.isLoaded(operationalModules)) return null;

  return (
    <ResourceShowView
      operationalModules={operationalModules}
      title={"Offline Dashboard"}
      resourceId={id}
      resourceName={"dashboard"}
      resourceURLName={"dashboard"}
      render={dashboard => render(dashboard, operationalModules)}
      mapResource={resource => DashboardService.mapDashboardFromResource(resource, operationalModules)}
      userInfo={userInfo}
      editPrivilegeType={Privilege.PrivilegeType.EditOfflineDashboardAndReportCard}
      defaultResource={WebDashboard.createNew()}
    />
  );
};

export default DashboardShow;
