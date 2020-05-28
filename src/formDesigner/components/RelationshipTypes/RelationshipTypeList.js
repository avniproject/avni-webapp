import React, { Fragment, useState, useEffect } from "react";
import MaterialTable from "material-table";
import http from "common/utils/httpClient";
import { isEqual } from "lodash";
import { Redirect, withRouter } from "react-router-dom";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import { cloneDeep } from "lodash";

import { CreateComponent } from "../../../common/components/CreateComponent";

const RelationshipTypeList = ({ history }) => {
  const columns = [
    {
      title: "Relationship",
      render: rowData => <span>{rowData.individualAIsToBRelation.name}</span>
    },
    {
      title: "Reverse Relationship",
      render: rowData => <span>{rowData.individualBIsToARelation.name}</span>
    }
  ];

  const [redirect, setRedirect] = useState(false);
  const [result, setResult] = useState([]);
  const [isIndividualSubjectTypeAvailable, setIsIndividualSubjectTypeAvailable] = useState("");

  const tableRef = React.createRef();
  const refreshTable = ref => ref.current && ref.current.onQueryChange();

  useEffect(() => {
    let flag = "false";
    http
      .get("/web/subjectType")
      .then(response => {
        response.data._embedded.subjectType.forEach(subjectType => {
          if (subjectType.name.toLowerCase() === "individual") {
            flag = "true";
          }
        });
        setIsIndividualSubjectTypeAvailable(flag);
      })
      .catch(error => {});

    http
      .get("/web/relationshipType")
      .then(response => {
        setResult(response.data);
      })
      .catch(error => {});
  }, []);

  const addNewConcept = () => {
    setRedirect(true);
  };

  const voidRelationshipType = rowData => ({
    icon: "delete_outline",
    tooltip: "Delete relationship",
    onClick: (event, rowData) => {
      const voidedMessage = "Do you really want to delete the relationship type ?";
      if (window.confirm(voidedMessage)) {
        http
          .delete("/web/relationshipType/" + rowData.id)
          .then(response => {
            if (response.status === 200) {
              const index = result.indexOf(rowData);
              const clonedResult = cloneDeep(result);
              clonedResult.splice(index, 1);
              setResult(clonedResult);
            }
          })
          .catch(error => {});
      }
    }
  });

  return (
    <>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Title title="Relationship Types" />

        <div className="container">
          {isIndividualSubjectTypeAvailable === "false" && (
            <div style={{ color: "red", size: "10" }}>
              Please click <a href={`#/appDesigner/subjectType/create`}>here</a> and create an
              Individual subject type to enable this screen.
            </div>
          )}
          {isIndividualSubjectTypeAvailable === "true" && (
            <div>
              <div style={{ float: "right", right: "50px", marginTop: "15px" }}>
                <CreateComponent onSubmit={addNewConcept} name="New Relationship type" />
              </div>

              <MaterialTable
                title=""
                components={{
                  Container: props => <Fragment>{props.children}</Fragment>
                }}
                tableRef={tableRef}
                columns={columns}
                data={result}
                options={{
                  addRowPosition: "first",
                  sorting: true,
                  debounceInterval: 500,
                  search: false,
                  rowStyle: rowData => ({
                    backgroundColor: rowData["voided"] ? "#DBDBDB" : "#fff"
                  })
                }}
                actions={[voidRelationshipType]}
              />
            </div>
          )}
        </div>
      </Box>
      {redirect && <Redirect to={"/appDesigner/relationshipType/create"} />}
    </>
  );
};

function areEqual(prevProps, nextProps) {
  return isEqual(prevProps, nextProps);
}

export default withRouter(React.memo(RelationshipTypeList, areEqual));
