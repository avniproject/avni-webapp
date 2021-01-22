import React from "react";
import ResourceListView from "../../common/ResourceListView";

const DashboardList = ({ history }) => {
  const columns = [
    {
      title: "Name",
      render: rowData =>
        !rowData.voided && <a href={`#/appDesigner/dashboard/${rowData.id}/show`}>{rowData.name}</a>
    },
    {
      title: "Description",
      render: rowData => rowData.description
    }
  ];

  return (
    <ResourceListView
      history={history}
      title={"Offline Dashboard"}
      resourceName={"dashboard"}
      resourceURLName={"dashboard"}
      columns={columns}
    />
  );
};

export default DashboardList;
