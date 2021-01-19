import React from "react";
import { ShowLabelValue } from "../../common/ShowLabelValue";
import ResourceShowView from "../../common/ResourceShowView";
import FormLabel from "@material-ui/core/FormLabel";
import { map, orderBy } from "lodash";

export const DashboardShow = props => {
  const renderColumns = dashboard => {
    return (
      <div>
        <ShowLabelValue label={"Name"} value={dashboard.name} />
        <p />
        <ShowLabelValue label={"Description"} value={dashboard.description} />
        <p />
        <FormLabel style={{ fontSize: "13px" }}>{"Cards"}</FormLabel>
        <br />
        {map(orderBy(dashboard.cards, "displayOrder"), (card, index) => {
          return (
            <li key={index}>
              <a href={`#/appDesigner/reportCard/${card.id}/show`}>{card.name}</a>
              <p />
            </li>
          );
        })}
      </div>
    );
  };

  return (
    <ResourceShowView
      title={"Dashboard"}
      resourceId={props.match.params.id}
      resourceName={"dashboard"}
      resourceURLName={"dashboard"}
      renderColumns={dashboard => renderColumns(dashboard)}
    />
  );
};
