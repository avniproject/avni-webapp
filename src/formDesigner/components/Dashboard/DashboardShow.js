import React from "react";
import { ShowLabelValue } from "../../common/ShowLabelValue";
import ResourceShowView from "../../common/ResourceShowView";
import FormLabel from "@material-ui/core/FormLabel";
import ShowDashboardSections from "./ShowDashboardSections";

export const DashboardShow = props => {
  const renderColumns = dashboard => {
    return (
      <div>
        <ShowLabelValue label={"Name"} value={dashboard.name} />
        <p />
        <ShowLabelValue label={"Description"} value={dashboard.description} />
        <p />
        <FormLabel style={{ fontSize: "13px" }}>{"Sections"}</FormLabel>
        <br />
        <ShowDashboardSections sections={dashboard.sections} />
      </div>
    );
  };

  return (
    <ResourceShowView
      title={"Offline Dashboard"}
      resourceId={props.match.params.id}
      resourceName={"dashboard"}
      resourceURLName={"dashboard"}
      renderColumns={dashboard => renderColumns(dashboard)}
    />
  );
};
