import React, { Fragment, useState } from "react";
import MaterialTable from "material-table";
import { isEqual } from "lodash";
import { Redirect, withRouter } from "react-router-dom";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import { CreateComponent } from "../../common/components/CreateComponent";
import EntityListUtil from "../Util/EntityListUtil";
import ApplicationMenuService from "../service/ApplicationMenuService";

const ApplicationMenuList = ({ history }) => {
  const [createTriggered, triggerCreate] = useState(false);

  const columns = [
    {
      title: "Display Key",
      defaultSort: "asc",
      sorting: false,
      field: "displayKey",
      render: rowData => (
        <a href={`#/appDesigner/applicationMenu/${rowData.id}/show`}>{rowData.displayKey}</a>
      )
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

  const fetchData = query =>
    new Promise(resolve => {
      ApplicationMenuService.getMenuList().then(result =>
        resolve({
          data: result
        })
      );
    });

  return (
    <>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Title title="Menu Items" />

        <div className="container">
          <div>
            <div style={{ float: "right", right: "50px", marginTop: "15px" }}>
              <CreateComponent onSubmit={() => triggerCreate(true)} name="New Menu Item" />
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
                EntityListUtil.createEditAction(history, "applicationMenu", "application menu"),
                EntityListUtil.createVoidAction(
                  tableRef,
                  "menuItem",
                  "application menu",
                  "displayKey"
                )
              ]}
            />
          </div>
        </div>
      </Box>
      {createTriggered && <Redirect to={"/appDesigner/applicationMenu/create"} />}
    </>
  );
};

function areEqual(prevProps, nextProps) {
  return isEqual(prevProps, nextProps);
}

export default withRouter(React.memo(ApplicationMenuList, areEqual));
