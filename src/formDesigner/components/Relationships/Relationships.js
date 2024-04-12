import React, { useState, useEffect } from "react";
import http from "common/utils/httpClient";
import { isEqual } from "lodash";
import { Redirect, withRouter } from "react-router-dom";
import Box from "@material-ui/core/Box";
import { cloneDeep } from "lodash";

import { Title } from "react-admin";
import { CreateComponent } from "../../../common/components/CreateComponent";
import AvniMaterialTable from "adminApp/components/AvniMaterialTable";
import { connect } from "react-redux";
import UserInfo from "../../../common/model/UserInfo";
import { Privilege } from "openchs-models";
import Edit from "@material-ui/icons/Edit";
import Delete from "@material-ui/icons/DeleteOutline";

function hasEditPrivilege(userInfo) {
  return UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.EditSubjectType);
}

const Relationships = ({ history, userInfo }) => {
  const columns = [
    {
      title: "Name",
      render: rowData => !rowData.voided && <a href={`#/appDesigner/relationship/${rowData.id}/show`}>{rowData.name}</a>
    },
    {
      title: "Genders",
      render: rowData => {
        const genders = rowData.genders.map(gender => gender.name);
        return genders.join();
      }
    }
  ];

  const [redirect, setRedirect] = useState(false);
  const [result, setResult] = useState([]);
  const [isIndividualSubjectTypeAvailable, setIsIndividualSubjectTypeAvailable] = useState("");

  const tableRef = React.createRef();

  useEffect(() => {
    let flag = "false";
    http.get("/web/subjectType").then(response => {
      response.data._embedded.subjectType.forEach(subjectType => {
        if (subjectType.type === "Person") {
          flag = "true";
        }
      });
      setIsIndividualSubjectTypeAvailable(flag);
    });

    http.get("/web/relation").then(response => {
      const result = response.data.filter(l => l.voided === false);
      setResult(result);
    });
  }, []);

  const addNewConcept = () => {
    setRedirect(true);
  };
  const editRelationship = rowData => ({
    icon: () => <Edit />,
    tooltip: "Edit relarionship",
    onClick: event => history.push(`/appDesigner/relationship/${rowData.id}`),
    disabled: rowData.voided
  });

  const voidRelationship = rowData => ({
    icon: () => <Delete />,
    tooltip: "Delete relationship",
    onClick: (event, rowData) => {
      const voidedMessage = "Do you really want to delete the relationship " + rowData.name + " ?";
      if (window.confirm(voidedMessage)) {
        http.delete("/web/relation/" + rowData.id).then(response => {
          if (response.status === 200) {
            const index = result.indexOf(rowData);
            const clonedResult = cloneDeep(result);
            clonedResult.splice(index, 1);
            setResult(clonedResult);
          }
        });
      }
    }
  });

  return (
    <>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Title title="Relationships" />

        <div className="container">
          {isIndividualSubjectTypeAvailable === "false" && (
            <div style={{ color: "red", size: "10" }}>
              Please click <a href={`#/appDesigner/subjectType/create`}>here</a> and create an Person subject type to enable this screen.
            </div>
          )}
          {isIndividualSubjectTypeAvailable === "true" && (
            <div>
              {hasEditPrivilege(userInfo) && (
                <div style={{ float: "right", right: "50px", marginTop: "15px" }}>
                  <CreateComponent onSubmit={addNewConcept} name="New Relationship" />
                </div>
              )}

              <AvniMaterialTable
                title=""
                ref={tableRef}
                columns={columns}
                fetchData={result}
                options={{
                  pageSize: 10,
                  addRowPosition: "first",
                  sorting: true,
                  debounceInterval: 500,
                  search: false,
                  rowStyle: rowData => ({
                    backgroundColor: rowData["voided"] ? "#DBDBDB" : "#fff"
                  })
                }}
                actions={hasEditPrivilege(userInfo) && [editRelationship, voidRelationship]}
                route={"/appdesigner/relationship"}
              />
            </div>
          )}
        </div>
      </Box>
      {redirect && <Redirect to={"/appDesigner/relationship/create"} />}
    </>
  );
};

function areEqual(prevProps, nextProps) {
  return isEqual(prevProps, nextProps);
}

const mapStateToProps = state => ({
  userInfo: state.app.userInfo
});

export default withRouter(connect(mapStateToProps)(React.memo(Relationships, areEqual)));
