import React, { Fragment, useCallback, useState } from "react";
import Tabs from "@material-ui/core/Tabs";
import Box from "@material-ui/core/Box";
import Tab from "@material-ui/core/Tab";
import MaterialTable from "material-table";
import ScreenWithAppBar from "../../common/components/ScreenWithAppBar";
import { Link, withRouter } from "react-router-dom";
import Typography from "@material-ui/core/Typography";
import { Breadcrumbs, LinearProgress, Snackbar } from "@material-ui/core";
import AddContactGroupSubjects from "./AddContactGroupSubjects";
import AddContactGroupUsers from "./AddContactGroupUsers";
import { getLinkTo } from "../../common/utils/routeUtil";
import BroadcastPath from "../utils/BroadcastPath";
import ContactService from "../api/ContactService";
import { Edit } from "@material-ui/icons";
import IconButton from "@material-ui/core/IconButton";
import AddEditContactGroup from "./AddEditContactGroup";
import { MaterialTableToolBar, MaterialTableToolBarButton } from "../../common/material-table/MaterialTableToolBar";
import ReceiverType from "./ReceiverType";
import GroupMessageTab from "./GroupMessageTab";
import { useTranslation } from "react-i18next";
import CustomizedSnackbar from "../../formDesigner/components/CustomizedSnackbar";
import materialTableIcons from "../../common/material-table/MaterialTableIcons";

const tableRef = React.createRef();

const fetchData = (query, contactGroupId, onContactGroupLoaded) => {
  return new Promise(resolve =>
    ContactService.getContactGroupContacts(contactGroupId, query.page, query.pageSize).then(data => {
      onContactGroupLoaded(data);
      resolve(data["contacts"]);
    })
  );
};

function Members({ contactGroupId, contactGroupMembersUpdated, contactGroupMembersVersion, onContactGroupLoaded }) {
  const { t } = useTranslation();
  const [addingSubjects, setAddingSubject] = useState(false);
  const [addingUsers, setAddingUser] = useState(false);
  const [error, setError] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(false);
  const [userAdded, setUserAdded] = useState(false);
  const [subjectAdded, setSubjectAdded] = useState(false);
  const [userDeleted, setUserDeleted] = useState(false);

  const columns = [
    {
      title: t("name"),
      sorting: false,
      field: "name"
    },
    {
      title: t("maskedPhone"),
      sorting: false,
      field: "maskedPhone"
    }
  ];

  const removeContactFromGroup = useCallback(
    contactRows => {
      ContactService.removeContactsFromGroup(contactGroupId, contactRows.map(x => x.id))
        .then(() => {
          contactGroupMembersUpdated();
          setUserDeleted(true);
        })
        .catch(error => setError(error))
        .finally(() => setDisplayProgress(false));
      setDisplayProgress(true);
    },
    [error, contactGroupMembersVersion]
  );

  const addingSubject = useCallback(() => {
    setAddingSubject(true);
    setError(false);
  }, []);

  const addingUser = useCallback(() => {
    setAddingUser(true);
    setError(false);
  }, []);

  const onSubjectAdd = useCallback(() => {
    contactGroupMembersUpdated();
    setSubjectAdded(true);
    setAddingSubject(false);
  }, []);

  const onUserAdd = useCallback(() => {
    setAddingUser(false);
    setUserAdded(true);
    contactGroupMembersUpdated();
  }, []);

  return (
    <div className="container">
      {addingSubjects && (
        <AddContactGroupSubjects
          contactGroupId={contactGroupId}
          onClose={() => setAddingSubject(false)}
          onSubjectAdd={subject => onSubjectAdd()}
        />
      )}
      {addingUsers && (
        <AddContactGroupUsers contactGroupId={contactGroupId} onClose={() => setAddingUser(false)} onUserAdd={user => onUserAdd()} />
      )}
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
      <MaterialTable
        icons={materialTableIcons}
        key={contactGroupMembersVersion}
        title=""
        components={{
          Container: props => <Fragment>{props.children}</Fragment>,
          Toolbar: props => (
            <MaterialTableToolBar
              toolBarButtons={[
                new MaterialTableToolBarButton(contactRows => removeContactFromGroup(contactRows), true, "Delete"),
                new MaterialTableToolBarButton(() => addingSubject(), false, "Add Subject"),
                new MaterialTableToolBarButton(() => addingUser(), false, "Add User")
              ]}
              {...props}
            />
          )
        }}
        tableRef={tableRef}
        columns={columns}
        data={query => fetchData(query, contactGroupId, onContactGroupLoaded)}
        options={{
          addRowPosition: "first",
          sorting: false,
          headerStyle: {
            zIndex: 1
          },
          debounceInterval: 500,
          search: false,
          selection: true,
          rowStyle: rowData => ({
            backgroundColor: "#fff"
          })
        }}
        actions={[]}
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
          <Typography component={"span"} color="textPrimary">
            {group["label"]}
          </Typography>
          <IconButton onClick={() => setEditingContactGroup(true)}>
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
