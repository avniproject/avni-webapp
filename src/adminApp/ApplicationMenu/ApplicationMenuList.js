import React, { Fragment, useState } from "react";
import MaterialTable from "material-table";
import http from "common/utils/httpClient";
import { isEqual } from "lodash";
import { Redirect, withRouter } from "react-router-dom";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import { CreateComponent } from "../../common/components/CreateComponent";
import EntityListUtil from "../Util/EntityListUtil";

const ApplicationMenuList = ({ history }) => {
  const columns = [
    {
      title: "Display Key",
      defaultSort: "asc",
      sorting: false,
      field: "displayKey"
    },
    {
      title: "Type",
      sorting: false,
      field: "type"
    },
    {
      title: "Icon",
      sorting: false,
      field: "icon"
    },
    {
      title: "Group",
      sorting: false,
      field: "group"
    }
  ];

  const tableRef = React.createRef();

  const [redirect, setRedirect] = useState(false);

  const fetchData = query =>
    new Promise(resolve => {
      let apiUrl = "/web/menuItem";
      http
        .get(apiUrl)
        .then(response => response.data)
        .then(result => {
          resolve({
            data: result
          });
        });
    });

  return (
    <>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Title title="Menu Items" />

        <div className="container">
          <div>
            <div style={{ float: "right", right: "50px", marginTop: "15px" }}>
              <CreateComponent onSubmit={() => {}} name="New Menu Item" />
            </div>

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
                  backgroundColor: rowData["active"] ? "#fff" : "#DBDBDB"
                })
              }}
              actions={[
                EntityListUtil.createEditAction(history, "menuItem", "menu item"),
                EntityListUtil.createVoidAction(tableRef, "menuItem", "menu item", "displayKey")
              ]}
            />
          </div>
        </div>
      </Box>
      {redirect && <Redirect to={"/appDesigner/menuItem/create"} />}
    </>
  );
};

function areEqual(prevProps, nextProps) {
  return isEqual(prevProps, nextProps);
}

export default withRouter(React.memo(ApplicationMenuList, areEqual));
