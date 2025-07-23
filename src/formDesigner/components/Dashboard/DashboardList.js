import ResourceListView from "../../common/ResourceListView";
import { Privilege } from "openchs-models";
import { useSelector } from "react-redux";

const DashboardList = () => {
  const userInfo = useSelector(state => state.app.userInfo);

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
      title="Offline Dashboard"
      resourceName="dashboard"
      resourceURLName="dashboard"
      columns={columns}
      userInfo={userInfo}
      editPrivilegeType={Privilege.PrivilegeType.EditOfflineDashboardAndReportCard}
    />
  );
};

export default DashboardList;
