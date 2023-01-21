import React, {Fragment, useEffect} from "react";
import Tabs from "@material-ui/core/Tabs";
import Box from "@material-ui/core/Box";
import Tab from "@material-ui/core/Tab";
import ScreenWithAppBar from "../../common/components/ScreenWithAppBar";
import { getHref } from "../../common/utils/routeUtil";
import BroadcastPath from "../utils/BroadcastPath";
import MessagesTab from "./MessagesTab";
import GroupsTab from "./GroupsTab";
import ContactService from "../api/ContactService";
import {useHistory, useParams} from "react-router-dom";

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
    field: "label",
    render: rowData => <ContactGroupLink rowData={rowData} column="label" />
  },
  {
    title: "Description",
    defaultSort: "asc",
    sorting: false,
    field: "description"
  },
  {
    title: "No of contacts",
    sorting: false,
    field: "contactsCount",
    render: rowData => <ContactGroupLink rowData={rowData} column="contactsCount" />
  }
];

const fetchData = query => {
  return new Promise(resolve =>
    ContactService.getContactGroups(query.page, query.pageSize).then(data => resolve(data))
  );
};

function TabContent(props) {
  const { children, activeTab, currentTab } = props;
  return <Fragment>{activeTab === currentTab && children}</Fragment>;
}

const WhatsAppHome = () => {
  const defaultActiveTab = "groups";
  const {activeTab} = useParams();
  const history = useHistory();

  useEffect(() => {
    if(!activeTab){
      history.push(`/${BroadcastPath.WhatsAppFullPath}/${defaultActiveTab}`);
    }
  }, []);

  const toggle = (event, tab) => {
    if (activeTab !== tab)  history.push(`/${BroadcastPath.WhatsAppFullPath}/${tab}`);
  }

  return (
    <ScreenWithAppBar appbarTitle={"WhatsApp Messaging"}>
      <Box sx={{ flexGrow: 1, bgcolor: "background.paper", display: "flex" }}>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={activeTab}
          onChange={toggle}
          sx={{ borderRight: 1, borderColor: "divider" }}
        >
          <Tab label="Groups" value="groups" />
          <Tab label="Messages" value="messages" />
        </Tabs>
        <TabContent activeTab={activeTab} currentTab={"groups"}>
          <GroupsTab groups={fetchData} columns={columns} />
        </TabContent>
        <TabContent activeTab={activeTab} currentTab={"messages"}>
          <MessagesTab groups={fetchData} columns={columns} />
        </TabContent>
      </Box>
    </ScreenWithAppBar>
  );
};

export default WhatsAppHome;
