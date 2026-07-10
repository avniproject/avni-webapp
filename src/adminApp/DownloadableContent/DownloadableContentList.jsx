import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Box, Grid, LinearProgress } from "@mui/material";
import { Title } from "react-admin";
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/DeleteOutline";
import { Privilege } from "openchs-models";
import AvniMaterialTable from "../components/AvniMaterialTable";
import { CreateComponent } from "../../common/components/CreateComponent";
import UserInfo from "../../common/model/UserInfo";
import DownloadableContentService from "./DownloadableContentService";

const columns = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "category", header: "Category" },
  { accessorKey: "contentKey", header: "Content Key" },
  { accessorKey: "sha256", header: "SHA-256" },
  {
    accessorKey: "needsKey",
    header: "Needs Key",
    Cell: ({ row }) => (row.original.needsKey ? "Yes" : "No"),
  },
];

const DownloadableContentList = () => {
  const navigate = useNavigate();
  const userInfo = useSelector((state) => state.app.userInfo);
  const tableRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  const canEdit = UserInfo.hasPrivilege(
    userInfo,
    Privilege.PrivilegeType.EditOrganisationConfiguration,
  );

  const fetchData = useCallback(async () => {
    const items = (await DownloadableContentService.getAll()).filter(
      (item) => !item.voided,
    );
    return { data: items, totalCount: items.length };
  }, []);

  useEffect(() => {
    fetchData().finally(() => setIsLoading(false));
  }, [fetchData]);

  const actions = useMemo(
    () =>
      canEdit
        ? [
            {
              icon: Edit,
              tooltip: "Edit",
              onClick: (event, row) =>
                navigate(
                  `/appDesigner/downloadableContent/${row.original.uuid}`,
                ),
            },
            {
              icon: Delete,
              tooltip: "Delete",
              onClick: (event, row) => {
                if (
                  window.confirm(
                    `Do you really want to delete ${row.original.name}?`,
                  )
                ) {
                  DownloadableContentService.delete(row.original.uuid).then(
                    () => {
                      if (tableRef.current) tableRef.current.refresh();
                    },
                  );
                }
              },
            },
          ]
        : [],
    [canEdit, navigate],
  );

  return (
    <Box sx={{ boxShadow: 2, p: 3, bgcolor: "background.paper" }}>
      <Title title="Downloadable Content" />
      <Grid container sx={{ justifyContent: "flex-end", mb: 2 }}>
        {!isLoading && canEdit && (
          <Grid>
            <CreateComponent
              name="New Downloadable Content"
              onSubmit={() =>
                navigate("/appDesigner/downloadableContent/create")
              }
            />
          </Grid>
        )}
      </Grid>
      {isLoading && <LinearProgress />}
      {!isLoading && (
        <AvniMaterialTable
          title=""
          ref={tableRef}
          columns={columns}
          fetchData={fetchData}
          options={{
            sorting: true,
            pageSize: 10,
            pageSizeOptions: [10, 25, 100],
          }}
          actions={actions}
          route="/appDesigner/downloadableContent"
        />
      )}
    </Box>
  );
};

export default DownloadableContentList;
