import React from "react";
import ResourceListView from "../../common/ResourceListView";
import { Privilege } from "openchs-models";
import { connect } from "react-redux";

const DashboardList = ({ history, userInfo }) => {
  const columns = [
    {
      accessorKey: "name",
      header: "Name",
      enableSorting: false,
      Cell: ({ row }) => !row.original.voided && <a href={`#/appDesigner/dashboard/${row.original.id}/show`}>{row.original.name}</a>
    },
    {
      accessorKey: "filters",
      header: "Filters",
      enableSorting: false,
      Cell: ({ row }) => row.original.filters?.map(filter => filter.name).join(", ") || ""
    },
    {
      accessorKey: "description",
      header: "Description",
      enableSorting: false,
      Cell: ({ row }) => row.original.description || ""
    }
  ];

  return (
    <ResourceListView
      history={history}
      title="Offline Dashboard"
      resourceName="dashboard"
      resourceURLName="dashboard"
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
