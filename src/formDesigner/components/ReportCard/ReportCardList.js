import React from "react";
import ColorValue from "../../common/ColorValue";
import ResourceListView from "../../common/ResourceListView";
import { connect } from "react-redux";
import { Privilege } from "openchs-models";
import { get } from "lodash";

const ReportCardList = ({ history, userInfo }) => {
  const columns = [
    {
      accessorKey: "name",
      header: "Name",
      Cell: ({ row }) => !row.original.voided && <a href={`#/appDesigner/reportCard/${row.original.id}/show`}>{row.original.name}</a>
    },
    {
      accessorKey: "standardReportCardType",
      header: "Standard Report Card",
      Cell: ({ row }) => get(row.original, "standardReportCardType.name") || ""
    },
    {
      accessorKey: "description",
      header: "Description",
      Cell: ({ row }) => (row.original.description || "").substring(0, 30)
    },
    {
      accessorKey: "color",
      header: "Colour",
      Cell: ({ row }) => <ColorValue colour={row.original.color} />
    }
  ];

  return (
    <ResourceListView
      history={history}
      title="Offline Report Card"
      resourceName="reportCard"
      resourceURLName="reportCard"
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
