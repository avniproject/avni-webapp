import React, { Fragment, useEffect, useState } from "react";
import { Tabs, Box, Tab } from "@mui/material";
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
  return <a href={getHref(`${BroadcastPath.ContactGroupFullPath}/${rowData["id"]}`)}>{rowData[column]}</a>;
}

const columns = [
  {
    accessorKey: "label",
    header: "Name",
    Cell: ({ row }) => <ContactGroupLink rowData={row.original} column="label" />
  },
  {
    accessorKey: "description",
    header: "Description"
  },
  {
    accessorKey: "contactsCount",
    header: "No of contacts",
    Cell: ({ row }) => <ContactGroupLink rowData={row.original} column="contactsCount" />
  }
];

function getDataFetcher(errorHandler) {
  return query => {
    return new Promise(resolve =>
      ContactService.getContactGroups(query.search ? query.search : "", query.page, query.pageSize)
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
  const { activeTab: activeTabFromParams, receiverId } = useParams(); // Added receiverId
  const history = useHistory();
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(activeTabFromParams || defaultActiveTab);

  useEffect(() => {
    if (!activeTabFromParams) {
      setActiveTab(defaultActiveTab);
      history.replace(`/${BroadcastPath.WhatsAppFullPath}/${defaultActiveTab}`);
    } else if (activeTabFromParams !== activeTab) {
      setActiveTab(activeTabFromParams);
    }
  }, [activeTabFromParams, history]);

  const toggle = (event, tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      history.push(`/${BroadcastPath.WhatsAppFullPath}/${tab}`);
    }
  };

  return (
    <ScreenWithAppBar appbarTitle={"WhatsApp Messaging"}>
      <ErrorMessage
        error={error}
        additionalStyle={{ marginBottom: 2000 }}
        customErrorMessage={"Please set up a Glific Account and configure it correctly for this page to show up."}
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
