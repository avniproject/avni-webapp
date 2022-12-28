import React, { Fragment } from "react";
import Tabs from "@material-ui/core/Tabs";
import Box from "@material-ui/core/Box";
import Tab from "@material-ui/core/Tab";
import MaterialTable from "material-table";
import GlificService from "../../adminApp/service/GlificService";
import ScreenWithAppBar from "../../common/components/ScreenWithAppBar";
import Button from "@material-ui/core/Button";

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
      <a href={`#/whatsApp/contactGroup/${rowData["id"]}`}>{rowData["contactsCount"]}</a>
    )
  }
];

const tableRef = React.createRef();

const fetchData = query => {
  return new Promise(resolve =>
    GlificService.getContactGroups(query.page, query.pageSize).then(data => resolve(data))
  );
};

const WhatsAppHome = () => {
  return (
    <ScreenWithAppBar appbarTitle={"WhatsApp Messaging"}>
      <Box sx={{ flexGrow: 1, bgcolor: "background.paper", display: "flex" }}>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={1}
          onChange={() => {}}
          sx={{ borderRight: 1, borderColor: "divider" }}
        >
          <Tab label="Groups" value={1} />
          <Tab label="Messages" value={2} />
        </Tabs>

        <div className="container">
          <Box style={{ display: "flex", flexDirection: "row-reverse" }}>
            <Button
              color="primary"
              variant="outlined"
              style={{ marginLeft: 10 }}
              onClick={event => {}}
            >
              Add Subject
            </Button>
            <Button color="primary" variant="outlined" onClick={event => {}}>
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
      </Box>
    </ScreenWithAppBar>
  );
};

export default WhatsAppHome;
