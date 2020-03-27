import React, { Fragment, useState, useEffect } from "react";
import MaterialTable from "material-table";
import http from "common/utils/httpClient";
import _ from "lodash";
import { withRouter, Redirect } from "react-router-dom";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import Button from "@material-ui/core/Button";
import WorkFlowFormCreation from "../WorkFlow/WorkFlowFormCreation";
import ShowSubjectType from "../WorkFlow/ShowSubjectType";

const ProgramList = ({ history }) => {
  const [formMapping, setMapping] = useState([]);
  const [subjectType, setSubjectType] = useState([]);

  useEffect(() => {
    http
      .get("/web/operationalModules")
      .then(response => {
        const formMap = response.data.formMappings;
        formMap.map(l => (l["isVoided"] = false));
        setMapping(formMap);
        setSubjectType(response.data.subjectTypes);
      })
      .catch(error => {});
  }, []);

  const columns = [
    { title: "Name", field: "name", defaultSort: "asc" },
    {
      title: "Subject type",
      sorting: false,
      render: rowData => (
        <ShowSubjectType
          rowDetails={rowData}
          subjectType={subjectType}
          formMapping={formMapping}
          setMapping={setMapping}
        />
      )
    },
    {
      title: "Enrolment form name",
      sorting: false,
      render: rowData => (
        <WorkFlowFormCreation
          rowDetails={rowData}
          formMapping={formMapping}
          setMapping={setMapping}
          formType="ProgramEnrolment"
          placeholder="Select enrolment form"
        />
      )
    },
    {
      title: "Exit form name",
      sorting: false,
      render: rowData => (
        <WorkFlowFormCreation
          rowDetails={rowData}
          formMapping={formMapping}
          setMapping={setMapping}
          formType="ProgramExit"
          placeholder="Select exit form"
        />
      )
    },
    {
      title: "Colour",
      field: "colour",
      type: "string",
      sorting: false,
      render: rowData => (
        <div
          style={{ width: "20px", height: "20px", border: "1px solid", background: rowData.colour }}
        >
          &nbsp;
        </div>
      )
    }
  ];

  const [redirect, setRedirect] = useState(false);

  const tableRef = React.createRef();

  const fetchData = query =>
    new Promise(resolve => {
      let apiUrl = "/web/program?";
      apiUrl += "size=" + query.pageSize;
      apiUrl += "&page=" + query.page;
      if (!_.isEmpty(query.orderBy.field))
        apiUrl += `&sort=${query.orderBy.field},${query.orderDirection}`;
      http
        .get(apiUrl)
        .then(response => response.data)
        .then(result => {
          resolve({
            data: result._embedded ? result._embedded.program : [],
            page: result.page.number,
            totalCount: result.page.totalElements
          });
        });
    });

  const editProgram = rowData => ({
    icon: "edit",
    tooltip: "Edit program",
    onClick: (event, form) => history.push(`/appDesigner/program/${rowData.id}`),
    disabled: rowData.voided
  });

  const addNewConcept = () => {
    setRedirect(true);
  };

  return (
    <>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Title title="Program" />

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
              actions={[editProgram]}
            />
          </div>
        </div>
      </Box>
      {redirect && <Redirect to={"/appDesigner/program/create"} />}
    </>
  );
};

export default withRouter(ProgramList);
