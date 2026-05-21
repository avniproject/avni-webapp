import { useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Box, Chip, Grid } from "@mui/material";
import { Title } from "react-admin";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  StarBorder as SetDefaultIcon,
  CalendarMonth as ViewGridIcon,
} from "@mui/icons-material";
import AvniMaterialTable from "adminApp/components/AvniMaterialTable";
import { CreateComponent } from "../../common/components/CreateComponent";
import { Privilege } from "openchs-models";
import UserInfo from "../../common/model/UserInfo";
import CalendarService from "./CalendarService";
import CalendarFormDialog from "./CalendarFormDialog";
import { extractServerErrorMessage } from "./utils/errorMessage";

function locationLabelFor(calendar) {
  if (!calendar.addressLevelUUID) return null;
  return calendar.addressLevelName || calendar.addressLevel || "Per-location";
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString();
}

const CalendarsList = () => {
  const navigate = useNavigate();
  const userInfo = useSelector((state) => state.app.userInfo);
  const tableRef = useRef(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [allCalendars, setAllCalendars] = useState(null);

  const canManage = UserInfo.hasPrivilege(
    userInfo,
    Privilege.PrivilegeType.ManageCalendars,
  );
  const hasGlobal =
    allCalendars?.some((c) => !c.voided && !c.addressLevelUUID) ?? false;

  const fetchData = useCallback(
    () =>
      CalendarService.list().then((rows) => {
        setAllCalendars(rows);
        const visible = rows.filter((r) => !r.voided);
        return { data: visible, totalCount: visible.length };
      }),
    [],
  );

  const onSave = (payload) =>
    payload.uuid
      ? CalendarService.update(payload.uuid, payload).then(() => {
          if (tableRef.current) tableRef.current.refresh();
        })
      : CalendarService.create(payload).then(() => {
          if (tableRef.current) tableRef.current.refresh();
        });

  const handleSetDefault = useCallback((calendar) => {
    CalendarService.setDefault(calendar.uuid)
      .then(() => tableRef.current?.refresh())
      .catch((err) => {
        alert(
          extractServerErrorMessage(err, "Failed to set as default calendar."),
        );
      });
  }, []);

  const handleDelete = useCallback((calendar) => {
    if (
      !window.confirm(
        `Delete calendar "${calendar.name}"? This action voids the calendar and its markers.`,
      )
    )
      return;
    CalendarService.remove(calendar.uuid)
      .then(() => tableRef.current?.refresh())
      .catch((err) => {
        alert(
          extractServerErrorMessage(
            err,
            "Failed to delete calendar. Server rejected the request.",
          ),
        );
      });
  }, []);

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        Cell: ({ row }) => (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate(`/appdesigner/calendar/${row.original.uuid}/grid`);
            }}
          >
            {row.original.name}
          </a>
        ),
      },
      {
        accessorKey: "scope",
        header: "Scope",
        Cell: ({ row }) =>
          row.original.addressLevelUUID ? (
            <span>{locationLabelFor(row.original)}</span>
          ) : (
            <Chip label="GLOBAL" size="small" color="primary" />
          ),
      },
      {
        accessorKey: "isDefault",
        header: "Default",
        Cell: ({ row }) =>
          !row.original.addressLevelUUID && row.original.isDefault ? (
            <Chip label="DEFAULT" size="small" color="success" />
          ) : null,
      },
      {
        accessorKey: "markerCountThisYear",
        header: "Markers this year",
        Cell: ({ row }) => row.original.markerCountThisYear ?? "—",
      },
      {
        accessorKey: "lastModifiedDateTime",
        header: "Last modified",
        Cell: ({ row }) => formatDate(row.original.lastModifiedDateTime),
      },
    ],
    [navigate],
  );

  const actions = useMemo(() => {
    if (!canManage) return [];
    return [
      {
        icon: ViewGridIcon,
        tooltip: "Open year view",
        onClick: (_e, row) =>
          navigate(`/appdesigner/calendar/${row.original.uuid}/grid`),
      },
      {
        icon: EditIcon,
        tooltip: "Edit settings",
        onClick: (_e, row) => {
          setEditing(row.original);
          setDialogOpen(true);
        },
      },
      {
        icon: SetDefaultIcon,
        tooltip: "Set as default",
        onClick: (_e, row) => handleSetDefault(row.original),
        disabled: (row) =>
          Boolean(row.original.addressLevelUUID) ||
          Boolean(row.original.isDefault),
      },
      {
        icon: DeleteIcon,
        tooltip: "Delete calendar",
        onClick: (_e, row) => handleDelete(row.original),
      },
    ];
  }, [canManage, navigate, handleSetDefault, handleDelete]);

  if (!canManage) {
    return (
      <Box sx={{ boxShadow: 2, p: 3, bgcolor: "background.paper" }}>
        <Title title="Calendars" />
        You do not have permission to manage calendars.
      </Box>
    );
  }

  return (
    <Box
      sx={{
        boxShadow: 2,
        p: 3,
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Title title="Calendars" />
      <Grid container sx={{ justifyContent: "flex-end", mb: 2 }}>
        {allCalendars !== null && !hasGlobal && (
          <Grid>
            <CreateComponent
              onSubmit={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
              name="Add Calendar"
            />
          </Grid>
        )}
      </Grid>
      <AvniMaterialTable
        title=""
        ref={tableRef}
        columns={columns}
        fetchData={fetchData}
        options={{
          pageSize: 10,
          pageSizeOptions: [5, 10, 20],
          search: false,
          rowStyle: ({ original }) => ({
            backgroundColor: original.voided ? "#DBDBDB" : "#fff",
          }),
        }}
        actions={actions}
        route="/appdesigner/calendar"
      />
      <CalendarFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={onSave}
        calendar={editing}
        existingCalendars={allCalendars}
      />
    </Box>
  );
};

export default CalendarsList;
