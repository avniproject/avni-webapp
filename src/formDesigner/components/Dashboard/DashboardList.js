import React from "react";
import ResourceListView from "../../common/ResourceListView";
import { Privilege } from "openchs-models";
import { connect } from "react-redux";

const DashboardList = ({ history, userInfo }) => {
  const columns = [
    {
      title: "Name",
      render: rowData => !rowData.voided && <a href={`#/appDesigner/dashboard/${rowData.id}/show`}>{rowData.name}</a>,
      sorting: false
    },
    {
      title: "Filters",
      render: rowData => rowData.filters.map(filter => filter.name).join(", "),
      sorting: false
    },
    {
      title: "Description",
      render: rowData => rowData.description,
      sorting: false
    }
  ];

  return (
    <ResourceListView
      history={history}
      title={"Offline Dashboard"}
      resourceName={"dashboard"}
      resourceURLName={"dashboard"}
      columns={columns}
      userInfo={userInfo}
      editPrivilegeType={Privilege.PrivilegeType.EditOfflineDashboardAndReportCard}
    />
  );
};

const mapStateToProps = state => ({
  userInfo: state.app.userInfo
});

export default connect(mapStateToProps)(DashboardList);
