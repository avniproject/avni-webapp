import React from "react";
import ColorValue from "../../common/ColorValue";
import ResourceListView from "../../common/ResourceListView";

const ReportCardList = ({ history }) => {
  const columns = [
    {
      title: "Name",
      render: rowData =>
        !rowData.voided && (
          <a href={`#/appDesigner/reportCard/${rowData.id}/show`}>{rowData.name}</a>
        )
    },
    {
      title: "Description",
      render: rowData => rowData.description
    },
    {
      title: "Colour",
      render: rowData => <ColorValue colour={rowData.color} />
    }
  ];

  return (
    <ResourceListView
      history={history}
      title={"Offline Report Card"}
      resourceName={"card"}
      resourceURLName={"reportCard"}
      columns={columns}
    />
  );
};

export default ReportCardList;
