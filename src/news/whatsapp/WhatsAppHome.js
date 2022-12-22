import React, { Fragment } from "react";
import Tabs from "@material-ui/core/Tabs";
import Box from "@material-ui/core/Box";
import Tab from "@material-ui/core/Tab";
import AppBar from "../../common/components/AppBar";
import { CreateComponent } from "../../common/components/CreateComponent";
import MaterialTable from "material-table";
import ApplicationMenuService from "../../adminApp/service/ApplicationMenuService";

const columns = [
  {
    title: "Name",
    defaultSort: "asc",
    sorting: false,
    field: "name"
  },
  {
    title: "Receiver Type",
    sorting: false,
    field: "receiverType"
  },
  {
    title: "No of members",
    sorting: false,
    field: "numberOfMembers"
  }
];

const tableRef = React.createRef();

const fetchData = query => new Promise(resolve => resolve([]));

const WhatsAppHome = () => {
  return (
    <React.Fragment>
      <AppBar title={"Communication"} position={"sticky"} />
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
          <div>
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
        </div>
      </Box>
    </React.Fragment>
  );
};

export default WhatsAppHome;
