import React, { Fragment, useState, useEffect } from "react";
import MaterialTable from "material-table";
import http from "common/utils/httpClient";
import _ from "lodash";
import { withRouter, Redirect } from "react-router-dom";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import Button from "@material-ui/core/Button";
import WorkFlowFormCreation from "../WorkFlow/WorkFlowFormCreation";

const SubjectTypesList = ({ history }) => {
  const [formMapping, setMapping] = useState([]);

  useEffect(() => {
    http
      .get("/web/operationalModules")
      .then(response => {
        const formMap = response.data.formMappings;
        formMap.map(l => (l["isVoided"] = false));
        setMapping(formMap);
      })
      .catch(error => {});
  }, []);

  const columns = [
    { title: "Name", field: "name", defaultSort: "asc", sorting: false },
    {
      title: "Registration form name",
      field: "formName",
      sorting: false,
      render: rowData => (
        <WorkFlowFormCreation
          rowDetails={rowData}
          formMapping={formMapping}
          setMapping={setMapping}
          formType="IndividualProfile"
          placeholder="Select registration form"
        />
      )
    }
  ];

  const [redirect, setRedirect] = useState(false);

  const tableRef = React.createRef();

  const fetchData = query =>
    new Promise(resolve => {
      let apiUrl = "/web/subjectType?";
      apiUrl += "size=" + query.pageSize;
      apiUrl += "&page=" + query.page;
      if (!_.isEmpty(query.orderBy.field))
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

  const editSubjectType = rowData => ({
    icon: "edit",
    tooltip: "Edit subject type",
    onClick: (event, form) => history.push(`/appDesigner/subjectType/${rowData.id}`),
    disabled: rowData.voided
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
              actions={[editSubjectType]}
            />
          </div>
        </div>
      </Box>
      {redirect && <Redirect to={"/appDesigner/subjectType/create"} />}
    </>
  );
};

export default withRouter(SubjectTypesList);
