import React, { useState } from "react";
import { isEqual } from "lodash";
import { Redirect, withRouter } from "react-router-dom";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import { CreateComponent } from "../../common/components/CreateComponent";
import EntityListUtil from "../Util/EntityListUtil";
import ApplicationMenuService from "../service/ApplicationMenuService";
import { DocumentationContainer } from "../../common/components/DocumentationContainer";
import AvniMaterialTable from "adminApp/components/AvniMaterialTable";

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
    new Promise(resolve =>
      ApplicationMenuService.getMenuList().then(data => {
        resolve(data);
      })
    );

  return (
    <DocumentationContainer filename={"ApplicationMenu.md"}>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Title title="Menu Items" />

        <div className="container">
          <div>
            <div style={{ float: "right", right: "50px", marginTop: "15px" }}>
              <CreateComponent onSubmit={() => triggerCreate(true)} name="New Menu Item" />
            </div>

            <AvniMaterialTable
              title=""
              ref={tableRef}
              columns={columns}
              fetchData={fetchData}
              options={{
                addRowPosition: "first",
                sorting: false,
                debounceInterval: 500,
                search: false,
                rowStyle: rowData => ({
                  backgroundColor: "#fff"
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
              route={"/appdesigner/applicationMenu"}
            />
          </div>
        </div>
      </Box>
      {createTriggered && <Redirect to={"/appDesigner/applicationMenu/create"} />}
    </DocumentationContainer>
  );
};

function areEqual(prevProps, nextProps) {
  return isEqual(prevProps, nextProps);
}

export default withRouter(React.memo(ApplicationMenuList, areEqual));
