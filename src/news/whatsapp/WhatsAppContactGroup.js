import React, { Fragment, useState } from "react";
import Tabs from "@material-ui/core/Tabs";
import Box from "@material-ui/core/Box";
import Tab from "@material-ui/core/Tab";
import MaterialTable from "material-table";
import ScreenWithAppBar from "../../common/components/ScreenWithAppBar";
import { Link, withRouter } from "react-router-dom";
import Typography from "@material-ui/core/Typography";
import { Breadcrumbs, Snackbar } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import AddContactGroupSubjects from "./AddContactGroupSubjects";
import AddContactGroupUsers from "./AddContactGroupUsers";
import { getLinkTo } from "../../common/utils/routeUtil";
import BroadcastPath from "../utils/BroadcastPath";
import ContactService from "../api/ContactService";
import { Edit } from "@material-ui/icons";
import IconButton from "@material-ui/core/IconButton";
import AddEditContactGroup from "./AddEditContactGroup";

const columns = [
  {
    title: "Name",
    sorting: false,
    field: "name"
  },
  {
    title: "Masked phone",
    sorting: false,
    field: "maskedPhone"
  }
];

const tableRef = React.createRef();

const fetchData = (query, contactGroupId, setGroup) => {
  return new Promise(resolve =>
    ContactService.getContactGroupContacts(contactGroupId, query.page, query.pageSize).then(
      data => {
        setGroup(data["group"]);
        resolve(data["contacts"]);
      }
    )
  );
};

const WhatsAppContactGroup = ({ match }) => {
  const [group, setGroup] = useState({ label: "..." });
  const [addingSubjects, setAddingSubject] = useState(false);
  const [addingUsers, setAddingUser] = useState(false);
  const [editingContactGroup, setEditingContactGroup] = useState(false);
  const contactGroupId = match.params["contactGroupId"];
  const [contactGroupVersionKey, setContactGroupVersionKey] = useState(0);
  const [updatedContactGroup, setUpdatedContactGroup] = useState(false);

  return (
    <ScreenWithAppBar appbarTitle={"WhatsApp Contact Group"}>
      {addingSubjects && (
        <AddContactGroupSubjects
          contactGroupId={contactGroupId}
          onClose={() => setAddingSubject(false)}
          onSubjectAdd={subject => {
            setContactGroupVersionKey(contactGroupVersionKey + 1);
            setAddingSubject(false);
          }}
        />
      )}
      {addingUsers && (
        <AddContactGroupUsers
          contactGroupId={contactGroupId}
          onClose={() => setAddingUser(false)}
          onUserAdd={user => {
            setContactGroupVersionKey(contactGroupVersionKey + 1);
            setAddingUser(false);
          }}
        />
      )}
      {editingContactGroup && (
        <AddEditContactGroup
          onSave={() => {
            setContactGroupVersionKey(contactGroupVersionKey + 1);
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
          value={1}
          onChange={() => {}}
          sx={{ borderRight: 1, borderColor: "divider" }}
        >
          <Tab label="Members" value={1} />
          <Tab label="Messages Sent" value={2} />
        </Tabs>

        <div className="container">
          <Box style={{ display: "flex", flexDirection: "row-reverse" }}>
            <Button
              color="primary"
              variant="outlined"
              style={{ marginLeft: 10 }}
              onClick={() => setAddingSubject(true)}
            >
              Add Subject
            </Button>
            <Button color="primary" variant="outlined" onClick={event => setAddingUser(true)}>
              Add User
            </Button>
          </Box>
          <MaterialTable
            key={contactGroupVersionKey}
            title=""
            components={{
              Container: props => <Fragment>{props.children}</Fragment>
            }}
            tableRef={tableRef}
            columns={columns}
            data={query => fetchData(query, contactGroupId, setGroup)}
            options={{
              addRowPosition: "first",
              sorting: false,
              debounceInterval: 500,
              search: false,
              rowStyle: rowData => ({
                backgroundColor: "#fff"
              })
            }}
            actions={[]}
          />
        </div>
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
