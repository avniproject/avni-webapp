import React, { Fragment, useState, useEffect } from "react";
import MaterialTable from "material-table";
import http from "common/utils/httpClient";
import _ from "lodash";
import { withRouter, Redirect } from "react-router-dom";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import Button from "@material-ui/core/Button";
import { ShowSubjectType, ShowPrograms } from "../WorkFlow/ShowSubjectType";
import WorkFlowEncounterForm from "../WorkFlow/WorkFlowEncounterForm";

const EncounterTypeList = ({ history }) => {
  const [redirect, setRedirect] = useState(false);
  const [formMapping, setMapping] = useState([]);
  const [subjectType, setSubjectType] = useState([]);
  const [program, setProgram] = useState([]);
  const [notificationAlert, setNotificationAlert] = useState(false);
  const [message, setMessage] = useState("");

  const tableRef = React.createRef();

  useEffect(() => {
    http
      .get("/web/operationalModules")
      .then(response => {
        const formMap = response.data.formMappings;
        formMap.map(l => (l["isVoided"] = false));
        setMapping(formMap);
        setSubjectType(response.data.subjectTypes);
        setProgram(response.data.programs);
      })
      .catch(error => {});
  }, []);

  const columns = [
    {
      title: "Name",
      defaultSort: "asc",
      sorting: false,
      render: rowData => (
        <a href={`#/appDesigner/encounterType/${rowData.id}/show`}>{rowData.name}</a>
      )
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
          entityUUID="encounterTypeUUID"
        />
      )
    },
    {
      title: "Programs",
      sorting: false,
      render: rowData => (
        <ShowPrograms
          rowDetails={rowData}
          program={program}
          formMapping={formMapping}
          setMapping={setMapping}
        />
      )
    },
    {
      title: "Encounter form",
      sorting: false,
      render: rowData => (
        <WorkFlowEncounterForm
          key={rowData.uuid}
          rowDetails={rowData}
          formMapping={formMapping}
          setMapping={setMapping}
          placeholder="Select encounter form"
          fillFormName="Encounter Form"
          notificationAlert={notificationAlert}
          setNotificationAlert={setNotificationAlert}
          message={message}
          setMessage={setMessage}
          whichForm="encounter"
          redirectToWorkflow="encountertType"
        />
      )
    },
    {
      title: "Cancellation form",
      sorting: false,
      render: rowData => (
        <WorkFlowEncounterForm
          key={rowData.uuid}
          rowDetails={rowData}
          formMapping={formMapping}
          setMapping={setMapping}
          placeholder="Select cancellation form"
          fillFormName="Cancellation form"
          notificationAlert={notificationAlert}
          setNotificationAlert={setNotificationAlert}
          message={message}
          setMessage={setMessage}
          isProgramEncounter={true}
          whichForm="cancellation"
          redirectToWorkflow="encountertType"
        />
      )
    }
  ];

  const fetchData = query =>
    new Promise(resolve => {
      let apiUrl = "/web/encounterType?";
      apiUrl += "size=" + query.pageSize;
      apiUrl += "&page=" + query.page;
      if (!_.isEmpty(query.orderBy.field))
        apiUrl += `&sort=${query.orderBy.field},${query.orderDirection}`;
      http
        .get(apiUrl)
        .then(response => response.data)
        .then(result => {
          resolve({
            data: result._embedded ? result._embedded.encounterType : [],
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
        <Title title="Encounter types" />

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
      {redirect && <Redirect to={"/appDesigner/encounterType/create"} />}
    </>
  );
};

export default withRouter(EncounterTypeList);
