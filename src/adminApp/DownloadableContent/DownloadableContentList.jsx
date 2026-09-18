import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Box, Grid, LinearProgress, Tooltip } from "@mui/material";
import { Title } from "react-admin";
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/DeleteOutline";
import { Privilege } from "openchs-models";
import AvniMaterialTable from "../components/AvniMaterialTable";
import { CreateComponent } from "../../common/components/CreateComponent";
import UserInfo from "../../common/model/UserInfo";
import DownloadableContentService from "./DownloadableContentService";

// ~140 characters of unbreakable content across two columns pushes the table off screen. Elide the
// middle, not the ends: namespace, extension and enough hash to recognise a row are what matter.
const middleElide = (value, head, tail) => {
  if (typeof value !== "string" || value.length <= head + tail + 1) {
    return value || "";
  }
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
};

const ElidedCell = ({ value, head, tail }) => (
  <Tooltip title={value || ""} placement="top-start">
    <Box
      component="span"
      sx={{
        display: "block",
        maxWidth: "100%",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        fontFamily: "monospace",
      }}
    >
      {middleElide(value, head, tail)}
    </Box>
  </Tooltip>
);

const columns = [
  { accessorKey: "name", header: "Name", size: 220 },
  { accessorKey: "category", header: "Category", size: 130 },
  {
    accessorKey: "contentKey",
    header: "Content Key",
    size: 210,
    Cell: ({ row }) => (
      <ElidedCell value={row.original.contentKey} head={12} tail={10} />
    ),
  },
  {
    accessorKey: "sha256",
    header: "SHA-256",
    size: 150,
    Cell: ({ row }) => (
      <ElidedCell value={row.original.sha256} head={8} tail={6} />
    ),
  },
  {
    accessorKey: "needsKey",
    header: "Needs Key",
    size: 110,
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
          layoutMode="grid"
          muiTableContainerProps={{
            sx: { maxWidth: "100%", overflowX: "auto" },
          }}
        />
      )}
    </Box>
  );
};

export default DownloadableContentList;
