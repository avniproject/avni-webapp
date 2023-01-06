import React, { Fragment } from "react";
import Tabs from "@material-ui/core/Tabs";
import Box from "@material-ui/core/Box";
import Tab from "@material-ui/core/Tab";
import MaterialTable from "material-table";
import ContactService from "../../adminApp/service/ContactService";
import ScreenWithAppBar from "../../common/components/ScreenWithAppBar";
import { Link, withRouter } from "react-router-dom";
import Typography from "@material-ui/core/Typography";
import { Breadcrumbs } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import AddContactGroupSubjects from "./AddContactGroupSubjects";
import AddContactGroupUsers from "./AddContactGroupUsers";
import { getHref, getLinkTo } from "../../common/utils/routeUtil";
import BroadcastPath from "../utils/BroadcastPath";

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
  const [group, setGroup] = React.useState("");
  const [addingSubjects, setAddingSubject] = React.useState(false);
  const [addingUsers, setAddingUser] = React.useState(false);
  const contactGroupId = match.params["contactGroupId"];

  return (
    <ScreenWithAppBar appbarTitle={"WhatsApp Contact Group"}>
      {addingSubjects && (
        <AddContactGroupSubjects
          onClose={() => setAddingSubject(false)}
          onSubjectAdd={subject => ContactService.addSubjectToContactGroup(contactGroupId, subject)}
        />
      )}
      {addingUsers && (
        <AddContactGroupUsers
          onClose={() => setAddingUser(false)}
          onUserAdd={user => ContactService.addUserToContactGroup(contactGroupId, user)}
        />
      )}
      <Breadcrumbs aria-label="breadcrumb" style={{ marginBottom: 40 }}>
        <Link color="inherit" to={getLinkTo(BroadcastPath.WhatsAppFullPath)}>
          WhatsApp Groups
        </Link>
        <Typography component={"span"} color="textPrimary">
          {group["label"]}
        </Typography>
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
      </Box>
    </ScreenWithAppBar>
  );
};

export default withRouter(WhatsAppContactGroup);
