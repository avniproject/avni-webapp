import React from "react";
import ColorValue from "../../common/ColorValue";
import ResourceListView from "../../common/ResourceListView";
import { connect } from "react-redux";
import { Privilege } from "openchs-models";
import _ from "lodash";

const columns = [
  {
    title: "Name",
    render: rowData => !rowData.voided && <a href={`#/appDesigner/reportCard/${rowData.id}/show`}>{rowData.name}</a>
  },
  {
    title: "Standard Report Card",
    render: rowData => _.get(rowData, "standardReportCardType.name")
  },
  {
    title: "Description",
    render: rowData => _.truncate(rowData.description, 30)
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
      resourceName={"reportCard"}
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
