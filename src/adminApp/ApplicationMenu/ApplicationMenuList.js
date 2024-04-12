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
import { connect } from "react-redux";
import { Privilege } from "openchs-models";
import UserInfo from "../../common/model/UserInfo";

const columns = [
  {
    title: "Display Key",
    defaultSort: "asc",
    sorting: false,
    field: "displayKey",
    render: rowData => <a href={`#/appDesigner/applicationMenu/${rowData.id}/show`}>{rowData.displayKey}</a>
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

function hasEditPrivilege(userInfo) {
  return UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.EditApplicationMenu);
}

const ApplicationMenuList = ({ history, userInfo }) => {
  const [createTriggered, triggerCreate] = useState(false);

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
            {hasEditPrivilege(userInfo) && (
              <div style={{ float: "right", right: "50px", marginTop: "15px" }}>
                <CreateComponent onSubmit={() => triggerCreate(true)} name="New Menu Item" />
              </div>
            )}

            <AvniMaterialTable
              title=""
              ref={tableRef}
              columns={columns}
              fetchData={fetchData}
              options={{
                pageSize: 10,
                addRowPosition: "first",
                sorting: false,
                debounceInterval: 500,
                search: false,
                rowStyle: rowData => ({
                  backgroundColor: "#fff"
                })
              }}
              actions={
                hasEditPrivilege(userInfo) && [
                  EntityListUtil.createEditAction(history, "applicationMenu", "application menu"),
                  EntityListUtil.createVoidAction(tableRef, "menuItem", "application menu", "displayKey")
                ]
              }
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

const mapStateToProps = state => ({
  userInfo: state.app.userInfo
});

export default withRouter(connect(mapStateToProps)(React.memo(ApplicationMenuList, areEqual)));
