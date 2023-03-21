import React, { Fragment, useEffect, useState } from "react";
import Tabs from "@material-ui/core/Tabs";
import Box from "@material-ui/core/Box";
import Tab from "@material-ui/core/Tab";
import ScreenWithAppBar from "../../common/components/ScreenWithAppBar";
import { getHref } from "../../common/utils/routeUtil";
import BroadcastPath from "../utils/BroadcastPath";
import GroupsTab from "./GroupsTab";
import ContactService from "../api/ContactService";
import { useHistory, useParams } from "react-router-dom";
import WhatsAppSubjectsTab from "./WhatsAppSubjectsTab";
import ErrorMessage from "../../common/components/ErrorMessage";
import WhatsAppUsersTab from "./WhatsAppUsersTab";
import ReceiverType from "./ReceiverType";

function ContactGroupLink({ rowData, column }) {
  return (
    <a href={getHref(`${BroadcastPath.ContactGroupFullPath}/${rowData["id"]}`)}>
      {rowData[column]}
    </a>
  );
}

const columns = [
  {
    title: "Name",
    defaultSort: "asc",
    sorting: false,
    filtering: true,
    field: "label",
    render: rowData => <ContactGroupLink rowData={rowData} column="label" />
  },
  {
    title: "Description",
    defaultSort: "asc",
    sorting: false,
    filtering: false,
    field: "description"
  },
  {
    title: "No of contacts",
    sorting: false,
    field: "contactsCount",
    filtering: false,
    render: rowData => <ContactGroupLink rowData={rowData} column="contactsCount" />
  }
];

function getDataFetcher(errorHandler) {
  return query => {
    return new Promise(resolve =>
      ContactService.getContactGroups(
        !!query.search ? query.search : "",
        query.page,
        query.pageSize
      )
        .then(data => resolve(data))
        .catch(errorHandler)
    );
  };
}

function TabContent(props) {
  const { children, activeTab, currentTab } = props;
  return <Fragment>{activeTab === currentTab && children}</Fragment>;
}

const WhatsAppHome = function() {
  const defaultActiveTab = "groups";
  const { activeTab, receiverId } = useParams();
  const history = useHistory();

  const [error, setError] = useState(null);

  useEffect(() => {
    if (!activeTab) {
      history.push(`/${BroadcastPath.WhatsAppFullPath}/${defaultActiveTab}`);
    }
  }, []);

  const toggle = (event, tab) => {
    if (activeTab !== tab) history.push(`/${BroadcastPath.WhatsAppFullPath}/${tab}`);
  };

  return (
    <ScreenWithAppBar appbarTitle={"WhatsApp Messaging"}>
      <ErrorMessage
        error={error}
        additionalStyle={{ marginBottom: 2000 }}
        customErrorMessage={
          "Please set up a Glific Account and configure it correctly for this page to show up."
        }
      />
      <Box sx={{ flexGrow: 1, bgcolor: "background.paper", display: "flex" }}>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={activeTab}
          onChange={toggle}
          sx={{ borderRight: 1, borderColor: "divider" }}
        >
          <Tab label="Groups" value="groups" />
          <Tab label="Subjects" value="subjects" />
          <Tab label="Users" value="users" />
        </Tabs>
        <TabContent activeTab={activeTab} currentTab={"groups"}>
          <GroupsTab groups={getDataFetcher(setError)} columns={columns} />
        </TabContent>
        <TabContent activeTab={activeTab} currentTab={"subjects"}>
          <WhatsAppSubjectsTab receiverType={ReceiverType.Subject} receiverId={receiverId} />
        </TabContent>
        <TabContent activeTab={activeTab} currentTab={"users"}>
          <WhatsAppUsersTab receiverType={ReceiverType.User} receiverId={receiverId} />
        </TabContent>
      </Box>
    </ScreenWithAppBar>
  );
};

export default WhatsAppHome;
