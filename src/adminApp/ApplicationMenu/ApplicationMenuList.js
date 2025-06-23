import React, { useState, useRef, useMemo } from "react";
import { isEqual } from "lodash";
import { Redirect, withRouter } from "react-router-dom";
import Box from "@mui/material/Box";
import { Title } from "react-admin";
import { CreateComponent } from "../../common/components/CreateComponent";
import EntityListUtil from "../Util/EntityListUtil";
import ApplicationMenuService from "../service/ApplicationMenuService";
import { DocumentationContainer } from "../../common/components/DocumentationContainer";
import AvniMaterialTable from "adminApp/components/AvniMaterialTable";
import { connect } from "react-redux";
import { Privilege } from "openchs-models";
import UserInfo from "../../common/model/UserInfo";
import { Edit, Delete } from "@mui/icons-material";

function hasEditPrivilege(userInfo) {
  return UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.EditApplicationMenu);
}

const ApplicationMenuList = ({ history, userInfo }) => {
  const [createTriggered, triggerCreate] = useState(false);
  const tableRef = useRef(null);

  const columns = useMemo(
    () => [
      {
        accessorKey: "displayKey",
        header: "Display Key",
        enableSorting: false,
        Cell: ({ row }) => <a href={`#/appDesigner/applicationMenu/${row.original.id}/show`}>{row.original.displayKey}</a>
      },
      {
        accessorKey: "type",
        header: "Type",
        enableSorting: false
      },
      {
        accessorKey: "icon",
        header: "Icon",
        enableSorting: false
      },
      {
        accessorKey: "group",
        header: "Group",
        enableSorting: false
      }
    ],
    []
  );

  const fetchData = useMemo(
    () => ({ page, pageSize }) =>
      new Promise(resolve =>
        ApplicationMenuService.getMenuList().then(response => {
          const data = response.content || [];
          const start = page * pageSize;
          const paginatedData = data.slice(start, start + pageSize);
          resolve({
            data: paginatedData,
            totalCount: data.length
          });
        })
      ),
    []
  );

  const actions = useMemo(
    () =>
      hasEditPrivilege(userInfo)
        ? [
            {
              icon: Edit,
              tooltip: "Edit application menu",
              onClick: (event, row) => history.push(`/appDesigner/applicationMenu/${row.original.id}`),
              disabled: row => row.original.voided ?? false
            },
            {
              icon: Delete,
              tooltip: "Delete application menu",
              onClick: (event, row) => {
                const voidedMessage = `Do you really want to delete the application menu ${row.original.displayKey}?`;
                if (window.confirm(voidedMessage)) {
                  ApplicationMenuService.deleteMenu(row.original.id).then(() => {
                    if (tableRef.current) {
                      tableRef.current.refresh();
                    }
                  });
                }
              },
              disabled: row => row.original.voided ?? false
            }
          ]
        : [],
    [history, userInfo]
  );

  return (
    <DocumentationContainer filename={"ApplicationMenu.md"}>
      <Box
        sx={{
          boxShadow: 2,
          p: 3,
          bgcolor: "background.paper"
        }}
      >
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
                sorting: false,
                debounceInterval: 500,
                search: false,
                rowStyle: ({ original }) => ({
                  backgroundColor: "#fff"
                })
              }}
              actions={actions}
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
