import React, { Fragment, useState, useEffect } from "react";
import MaterialTable from "material-table";
import http from "common/utils/httpClient";
import _, { isEqual } from "lodash";
import { withRouter, Redirect } from "react-router-dom";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import Button from "@material-ui/core/Button";
import WorkFlowFormCreation from "../WorkFlow/WorkFlowFormCreation";
import ShowSubjectType from "../WorkFlow/ShowSubjectType";

const ProgramList = ({ history }) => {
  const [formMapping, setMapping] = useState([]);
  const [subjectType, setSubjectType] = useState([]);
  const [notificationAlert, setNotificationAlert] = useState(false);
  const [message, setMessage] = useState("");

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
    {
      title: "Name",
      defaultSort: "asc",
      sorting: false,
      render: rowData => <a href={`#/appDesigner/program/${rowData.id}/show`}>{rowData.name}</a>
    },
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
          key={rowData.uuid}
          rowDetails={rowData}
          formMapping={formMapping}
          setMapping={setMapping}
          formType="ProgramEnrolment"
          placeholder="Select enrolment form"
          customUUID="programUUID"
          fillFormName="Enrolment form"
          notificationAlert={notificationAlert}
          setNotificationAlert={setNotificationAlert}
          message={message}
          setMessage={setMessage}
        />
      )
    },
    {
      title: "Exit form name",
      sorting: false,
      render: rowData => (
        <WorkFlowFormCreation
          key={rowData.uuid}
          rowDetails={rowData}
          formMapping={formMapping}
          setMapping={setMapping}
          formType="ProgramExit"
          placeholder="Select exit form"
          customUUID="programUUID"
          fillFormName="Exit form"
          notificationAlert={notificationAlert}
          setNotificationAlert={setNotificationAlert}
          message={message}
          setMessage={setMessage}
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
            />
          </div>
        </div>
      </Box>
      {redirect && <Redirect to={"/appDesigner/program/create"} />}
    </>
  );
};
function areEqual(prevProps, nextProps) {
  return isEqual(prevProps, nextProps);
}

export default withRouter(React.memo(ProgramList, areEqual));
