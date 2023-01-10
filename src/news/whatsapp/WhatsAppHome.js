import React, { Fragment, useState } from "react";
import Tabs from "@material-ui/core/Tabs";
import Box from "@material-ui/core/Box";
import Tab from "@material-ui/core/Tab";
import MaterialTable from "material-table";
import ScreenWithAppBar from "../../common/components/ScreenWithAppBar";
import { getHref } from "../../common/utils/routeUtil";
import BroadcastPath from "../utils/BroadcastPath";
import MessagesTab from "./MessagesTab";
import Button from "@material-ui/core/Button";
import ContactService from "../api/ContactService";
import AddEditContactGroup from "./AddEditContactGroup";

const columns = [
  {
    title: "Name",
    defaultSort: "asc",
    sorting: false,
    field: "label"
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
    render: rowData => (
      <a href={getHref(`${BroadcastPath.ContactGroupFullPath}/${rowData["id"]}`)}>
        {rowData["contactsCount"]}
      </a>
    )
  }
];

const tableRef = React.createRef();

const fetchData = query => {
  return new Promise(resolve =>
    ContactService.getContactGroups(query.page, query.pageSize).then(data => resolve(data))
  );
};

function TabContent(props) {
  const { children, value, index } = props;

  return <React.Fragment>{value === index && children}</React.Fragment>;
}

const WhatsAppHome = () => {
  const [value, setValue] = React.useState(1);
  const [addingContactGroup, setAddingContactGroup] = useState(false);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <ScreenWithAppBar appbarTitle={"WhatsApp Messaging"}>
      <Box sx={{ flexGrow: 1, bgcolor: "background.paper", display: "flex" }}>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={value}
          onChange={handleChange}
          sx={{ borderRight: 1, borderColor: "divider" }}
        >
          <Tab label="Groups" value={1} />
          <Tab label="Messages" value={2} />
        </Tabs>
        <TabContent value={value} index={1}>
          <div className="container">
            {addingContactGroup && (
              <AddEditContactGroup
                onClose={() => setAddingContactGroup(false)}
                onSave={() => setAddingContactGroup(false)}
              />
            )}
            <Box style={{ display: "flex", flexDirection: "row-reverse" }}>
              <Button
                color="primary"
                variant="outlined"
                style={{ marginLeft: 10 }}
                onClick={() => setAddingContactGroup(true)}
              >
                Add Contact Group
              </Button>
            </Box>
            <MaterialTable
              title=""
              components={{
                Container: props => <Fragment>{props.children}</Fragment>
              }}
              tableRef={tableRef}
              columns={columns}
              data={fetchData}
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
        </TabContent>
        <TabContent value={value} index={2}>
          <MessagesTab groups={fetchData} columns={columns} />
        </TabContent>
      </Box>
    </ScreenWithAppBar>
  );
};

export default WhatsAppHome;
