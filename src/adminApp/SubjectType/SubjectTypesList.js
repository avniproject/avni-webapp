import React, { useState } from "react";
import http from "common/utils/httpClient";
import { get, isEmpty, isEqual } from "lodash";
import { Redirect, withRouter } from "react-router-dom";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import { findRegistrationForm } from "../domain/formMapping";
import { useFormMappings } from "./effects";
import { CreateComponent } from "../../common/components/CreateComponent";
import AvniMaterialTable from "adminApp/components/AvniMaterialTable";
import { connect } from "react-redux";
import UserInfo from "../../common/model/UserInfo";
import { Privilege } from "openchs-models";
import Edit from "@material-ui/icons/Edit";
import Delete from "@material-ui/icons/DeleteOutline";

function hasEditPrivilege(userInfo) {
  return UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.EditSubjectType);
}

const SubjectTypesList = ({ history, userInfo }) => {
  const [formMappings, setFormMappings] = useState([]);

  useFormMappings(setFormMappings);

  const columns = [
    {
      title: "Name",
      defaultSort: "asc",
      sorting: false,
      render: rowData => <a href={`#/appDesigner/subjectType/${rowData.id}/show`}>{rowData.name}</a>
    },
    {
      title: "Registration Form",
      field: "formName",
      sorting: false,
      render: rowData => {
        const formName = get(findRegistrationForm(formMappings, rowData), "formName");
        return hasEditPrivilege(userInfo) ? (
          <a href={`#/appdesigner/forms/${get(findRegistrationForm(formMappings, rowData), "formUUID")}`}>{formName}</a>
        ) : (
          formName
        );
      }
    },
    { title: "Type", field: "type" },
    { title: "Organisation Id", field: "organisationId", type: "numeric" }
  ];

  const [redirect, setRedirect] = useState(false);

  const tableRef = React.createRef();
  const refreshTable = ref => ref.current && ref.current.onQueryChange();

  const fetchData = query =>
    new Promise(resolve => {
      let apiUrl = "/web/subjectType?";
      apiUrl += "size=" + query.pageSize;
      apiUrl += "&page=" + query.page;
      if (!isEmpty(query.orderBy.field)) {
        const sortBy = query.orderBy.field === "type" ? "subjectTypeType" : query.orderBy.field;
        apiUrl += `&sort=${sortBy},${query.orderDirection}`;
      }
      http
        .get(apiUrl)
        .then(response => response.data)
        .then(result => {
          resolve({
            data: result._embedded ? result._embedded.subjectType : [],
            page: result.page.number,
            totalCount: result.page.totalElements
          });
        });
    });

  const addNewConcept = () => {
    setRedirect(true);
  };

  const editSubjectType = rowData => ({
    icon: () => <Edit />,
    tooltip: "Edit subject type",
    onClick: event => history.push(`/appDesigner/subjectType/${rowData.id}`),
    disabled: rowData.voided
  });

  const voidSubjectType = rowData => ({
    icon: () => <Delete />,
    tooltip: "Delete subject type",
    onClick: (event, rowData) => {
      const voidedMessage = "Do you really want to delete the subject type " + rowData.name + " ?";
      if (window.confirm(voidedMessage)) {
        http.delete("/web/subjectType/" + rowData.id).then(response => {
          if (response.status === 200) {
            refreshTable(tableRef);
          }
        });
      }
    }
  });

  return (
    <>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Title title="Subject Types" />

        <div className="container">
          <div>
            <div style={{ float: "right", right: "50px", marginTop: "15px" }}>
              {hasEditPrivilege(userInfo) && <CreateComponent onSubmit={addNewConcept} name="New Subject type" />}
            </div>

            <AvniMaterialTable
              title=""
              ref={tableRef}
              columns={columns}
              fetchData={fetchData}
              options={{
                pageSize: 10,
                addRowPosition: "first",
                sorting: true,
                debounceInterval: 500,
                search: false,
                rowStyle: rowData => ({
                  backgroundColor: rowData["active"] ? "#fff" : "#DBDBDB"
                })
              }}
              route={"/appdesigner/subjectType"}
              actions={hasEditPrivilege(userInfo) && [editSubjectType, voidSubjectType]}
            />
          </div>
        </div>
      </Box>
      {redirect && <Redirect to={"/appDesigner/subjectType/create"} />}
    </>
  );
};

function areEqual(prevProps, nextProps) {
  return isEqual(prevProps, nextProps);
}

const mapStateToProps = state => ({
  userInfo: state.app.userInfo
});

export default withRouter(connect(mapStateToProps)(React.memo(SubjectTypesList, areEqual)));
