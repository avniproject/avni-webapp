import { Fragment, useCallback, useState, useEffect } from "react";
import { Tabs, Box, Tab, Typography, Breadcrumbs, LinearProgress, Snackbar, IconButton } from "@mui/material";
import { MaterialReactTable } from "material-react-table";
import ScreenWithAppBar from "../../common/components/ScreenWithAppBar";
import { Link, withRouter } from "react-router-dom";
import AddContactGroupSubjects from "./AddContactGroupSubjects";
import AddContactGroupUsers from "./AddContactGroupUsers";
import { getLinkTo } from "../../common/utils/routeUtil";
import BroadcastPath from "../utils/BroadcastPath";
import ContactService from "../api/ContactService";
import { Edit } from "@mui/icons-material";
import AddEditContactGroup from "./AddEditContactGroup";
import ReceiverType from "./ReceiverType";
import GroupMessageTab from "./GroupMessageTab";
import { useTranslation } from "react-i18next";
import CustomizedSnackbar from "../../formDesigner/components/CustomizedSnackbar";
import Button from "@mui/material/Button";

const fetchData = async (query, contactGroupId, onContactGroupLoaded) => {
  const data = await ContactService.getContactGroupContacts(contactGroupId, query.page, query.pageSize);
  onContactGroupLoaded(data);
  return data["contacts"];
};

function Members({ contactGroupId, contactGroupMembersUpdated, contactGroupMembersVersion, onContactGroupLoaded }) {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [addingSubjects, setAddingSubject] = useState(false);
  const [addingUsers, setAddingUser] = useState(false);
  const [error, setError] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(false);
  const [userAdded, setUserAdded] = useState(false);
  const [subjectAdded, setSubjectAdded] = useState(false);
  const [userDeleted, setUserDeleted] = useState(false);

  const columns = [{ accessorKey: "name", header: t("name") }, { accessorKey: "maskedPhone", header: t("maskedPhone") }];

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = { page: pagination.pageIndex, pageSize: pagination.pageSize };
      const result = await fetchData(query, contactGroupId, onContactGroupLoaded);
      setData(result.content || result || []);
      setTotalRecords(result.totalElements || result.length || 0);
    } catch (err) {
      setError(err);
      setData([]);
      setTotalRecords(0);
    } finally {
      setIsLoading(false);
    }
  }, [pagination, contactGroupId, onContactGroupLoaded]);

  useEffect(() => {
    loadData();
  }, [loadData, contactGroupMembersVersion]);

  const removeContactFromGroup = useCallback(
    contactRows => {
      setDisplayProgress(true);
      ContactService.removeContactsFromGroup(contactGroupId, contactRows.map(x => x.id))
        .then(() => {
          contactGroupMembersUpdated();
          setUserDeleted(true);
        })
        .catch(err => setError(err))
        .finally(() => setDisplayProgress(false));
    },
    [contactGroupId, contactGroupMembersUpdated]
  );

  const onSubjectAdd = useCallback(() => {
    contactGroupMembersUpdated();
    setSubjectAdded(true);
    setAddingSubject(false);
  }, [contactGroupMembersUpdated]);

  const onUserAdd = useCallback(() => {
    setAddingUser(false);
    setUserAdded(true);
    contactGroupMembersUpdated();
  }, [contactGroupMembersUpdated]);

  return (
    <div className="container">
      {addingSubjects && (
        <AddContactGroupSubjects contactGroupId={contactGroupId} onClose={() => setAddingSubject(false)} onSubjectAdd={onSubjectAdd} />
      )}
      {addingUsers && <AddContactGroupUsers contactGroupId={contactGroupId} onClose={() => setAddingUser(false)} onUserAdd={onUserAdd} />}
      {(userAdded || subjectAdded || error || userDeleted) && (
        <CustomizedSnackbar
          variant={!error ? "success" : "error"}
          message={
            userAdded
              ? "User added successfully"
              : subjectAdded
              ? "Subject added successfully"
              : userDeleted
              ? "Deleted successfully"
              : "Unexpected error occurred"
          }
          getDefaultSnackbarStatus={snackbarStatus => {
            setUserAdded(snackbarStatus);
            setSubjectAdded(snackbarStatus);
            setError(snackbarStatus);
            setUserDeleted(snackbarStatus);
          }}
          defaultSnackbarStatus={userAdded || subjectAdded || error || userDeleted}
        />
      )}
      {displayProgress && <LinearProgress style={{ marginBottom: 30 }} />}
      <MaterialReactTable
        columns={columns}
        data={data}
        manualPagination
        onPaginationChange={setPagination}
        rowCount={totalRecords}
        state={{ pagination, isLoading }}
        enableSorting={false}
        enableGlobalFilter={false}
        enableColumnFilters={false}
        enableRowSelection
        initialState={{ pagination: { pageSize: 10 } }}
        muiTableProps={{
          sx: { table: { backgroundColor: "#fff" } }
        }}
        renderTopToolbarCustomActions={({ table }) => (
          <Box sx={{ display: "flex", gap: "8px" }}>
            <Button
              onClick={() => {
                const selectedRows = table.getSelectedRowModel().rows.map(row => row.original);
                removeContactFromGroup(selectedRows);
              }}
              disabled={table.getSelectedRowModel().rows.length === 0}
            >
              Delete
            </Button>
            <Button onClick={() => setAddingSubject(true)}>Add Subject</Button>
            <Button onClick={() => setAddingUser(true)}>Add User</Button>
          </Box>
        )}
      />
    </div>
  );
}

const ContactGroupTabs = {
  members: 1,
  messages: 2
};

const WhatsAppContactGroup = ({ match }) => {
  const [group, setGroup] = useState({ label: "..." });
  const contactGroupId = match.params["contactGroupId"];
  const [selectedTab, setSelectedTab] = useState(ContactGroupTabs.members);
  const [editingContactGroup, setEditingContactGroup] = useState(false);
  const [updatedContactGroup, setUpdatedContactGroup] = useState(false);
  const [contactGroupVersion, updateContactGroupVersion] = useState(0);

  return (
    <ScreenWithAppBar appbarTitle={"WhatsApp Contact Group"}>
      {editingContactGroup && (
        <AddEditContactGroup
          onSave={() => {
            updateContactGroupVersion(contactGroupVersion + 1);
            setEditingContactGroup(false);
            setUpdatedContactGroup(true);
          }}
          onClose={() => setEditingContactGroup(false)}
          contactGroup={group}
        />
      )}
      <Breadcrumbs aria-label="breadcrumb" style={{ marginBottom: 40 }}>
        <Link color="inherit" to={getLinkTo(BroadcastPath.WhatsAppFullPath)}>
          WhatsApp Groups
        </Link>
        <Box>
          <Typography component={"span"} sx={{ color: theme => theme.palette.text.primary }}>
            {group["label"]}
          </Typography>
          <IconButton onClick={() => setEditingContactGroup(true)} size="large">
            <Edit />
          </IconButton>
        </Box>
      </Breadcrumbs>
      <Box sx={{ flexGrow: 1, bgcolor: "background.paper", display: "flex" }}>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={selectedTab}
          onChange={() => {}}
          sx={{ borderRight: 1, borderColor: "divider" }}
        >
          <Tab label="Members" value={ContactGroupTabs.members} onClick={() => setSelectedTab(1)} />
          <Tab label="Messages" value={ContactGroupTabs.messages} onClick={() => setSelectedTab(2)} />
        </Tabs>

        {selectedTab === ContactGroupTabs.members && (
          <Members
            contactGroupId={contactGroupId}
            onContactGroupLoaded={contactGroup => setGroup(contactGroup["group"])}
            contactGroupMembersUpdated={() => updateContactGroupVersion(contactGroupVersion => contactGroupVersion + 1)}
            contactGroupMembersVersion={contactGroupVersion}
          />
        )}
        {selectedTab === ContactGroupTabs.messages && <GroupMessageTab contactGroupId={contactGroupId} receiverType={ReceiverType.Group} />}
        <Snackbar
          open={updatedContactGroup}
          autoHideDuration={3000}
          onClose={() => setUpdatedContactGroup(false)}
          message="Updated contact group"
        />
      </Box>
    </ScreenWithAppBar>
  );
};

export default withRouter(WhatsAppContactGroup);
