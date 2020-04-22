import React, { Fragment, useState } from "react";
import MaterialTable from "material-table";
import http from "common/utils/httpClient";
import { get, isEmpty, isEqual } from "lodash";
import { Redirect, withRouter } from "react-router-dom";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import Button from "@material-ui/core/Button";
import { findRegistrationForm } from "../domain/formMapping";
import { useFormMappings } from "./effects";

const SubjectTypesList = ({ history }) => {
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
      title: "Registration form name",
      field: "formName",
      sorting: false,
      render: rowData => (
        <a
          href={`#/appdesigner/forms/${get(
            findRegistrationForm(formMappings, rowData),
            "formUUID"
          )}`}
        >
          {get(findRegistrationForm(formMappings, rowData), "formName")}
        </a>
      )
    },
    { title: "Household", field: "household", type: "boolean" },
    { title: "Group", field: "group", type: "boolean" },
    { title: "Organisation Id", field: "organisationId", type: "numeric" }
  ];

  const [redirect, setRedirect] = useState(false);

  const tableRef = React.createRef();

  const fetchData = query =>
    new Promise(resolve => {
      let apiUrl = "/web/subjectType?";
      apiUrl += "size=" + query.pageSize;
      apiUrl += "&page=" + query.page;
      if (!isEmpty(query.orderBy.field))
        apiUrl += `&sort=${query.orderBy.field},${query.orderDirection}`;
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

  return (
    <>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Title title="Subject Type" />

        <div className="container">
          <div>
            <div style={{ float: "right", right: "50px", marginTop: "15px" }}>
              <Button color="primary" onClick={addNewConcept}>
                {" "}
                + CREATE{" "}
              </Button>
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
                sorting: true,
                debounceInterval: 500,
                search: false,
                rowStyle: rowData => ({
                  backgroundColor: rowData["voided"] ? "#DBDBDB" : "#fff"
                })
              }}
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

export default withRouter(React.memo(SubjectTypesList, areEqual));
