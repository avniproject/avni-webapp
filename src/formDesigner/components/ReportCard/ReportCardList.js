import ColorValue from "../../common/ColorValue";
import ResourceListView from "../../common/ResourceListView";
import { useSelector } from "react-redux";
import { Privilege } from "openchs-models";
import { get } from "lodash";

const ReportCardList = () => {
  const userInfo = useSelector(state => state.app.userInfo);
  const columns = [
    {
      accessorKey: "name",
      header: "Name",
      Cell: ({ row }) =>
        !row.original.voided && (
          <a
            href={`#/appDesigner/reportCard/${row.original.id}/show`}
            onClick={e => {
              e.preventDefault();
              navigate(`/appDesigner/reportCard/${row.original.id}/show`);
            }}
          >
            {row.original.name}
          </a>
        )
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
      title="Offline Report Card"
      resourceName="reportCard"
      resourceURLName="reportCard"
      columns={columns}
      userInfo={userInfo}
      editPrivilegeType={Privilege.PrivilegeType.EditOfflineDashboardAndReportCard}
    />
  );
};

export default ReportCardList;
