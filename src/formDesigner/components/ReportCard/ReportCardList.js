import React from "react";
import ColorValue from "../../common/ColorValue";
import ResourceListView from "../../common/ResourceListView";
import { connect } from "react-redux";
import { Privilege } from "openchs-models";

const columns = [
  {
    title: "Name",
    render: rowData => !rowData.voided && <a href={`#/appDesigner/reportCard/${rowData.id}/show`}>{rowData.name}</a>
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

const ReportCardList = ({ history, userInfo }) => {
  return (
    <ResourceListView
      history={history}
      title={"Offline Report Card"}
      resourceName={"card"}
      resourceURLName={"reportCard"}
      columns={columns}
      userInfo={userInfo}
      editPrivilegeType={Privilege.PrivilegeType.EditOfflineDashboardAndReportCard}
    />
  );
};

const mapStateToProps = state => ({
  userInfo: state.app.userInfo
});

export default connect(mapStateToProps)(ReportCardList);
