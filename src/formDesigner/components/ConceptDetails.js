import React, { useEffect, useState } from "react";
import EditIcon from "@material-ui/icons/Edit";
import http from "common/utils/httpClient";
import { Redirect } from "react-router-dom";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import FormLabel from "@material-ui/core/FormLabel";
import Grid from "@material-ui/core/Grid";
import Moment from "react-moment";
import RemoveIcon from "@material-ui/icons/Remove";
import { makeStyles } from "@material-ui/core/styles";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import { withRouter } from "react-router-dom";
import { isEmpty, orderBy } from "lodash";
import { ActiveStatusInShow } from "../../common/components/ActiveStatus";
import { Audit } from "./Audit";

const useStyles = makeStyles({
  table: {
    minWidth: 650
  }
});

function ConceptDetails(props) {
  const classes = useStyles();
  const [editAlert, setEditAlert] = useState(false);
  const [data, setData] = useState({});
  const [usage, setUsage] = useState({});

  useEffect(() => {
    http
      .get("/web/concept/" + props.match.params.uuid)
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.log(error);
      });
    http
      .get("/web/concept/usage/" + props.match.params.uuid)
      .then(response => {
        setUsage(response.data);
      })
      .catch(error => {
        console.log(error);
      });
  }, []);

  return (
    <>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Title title={"Concept: " + data.name} />
        <Grid container item sm={12} style={{ justifyContent: "flex-end" }}>
          <Button color="primary" type="button" onClick={() => setEditAlert(true)}>
            <EditIcon />
            Edit
          </Button>
        </Grid>
        <div className="container" style={{ float: "left" }}>
          <div>
            <FormLabel style={{ fontSize: "13px" }}>Name</FormLabel>
            <br />
            <span style={{ fontSize: "15px" }}>{data.name}</span>
          </div>
          <p />
          <div>
            <FormLabel style={{ fontSize: "13px" }}>Datatype</FormLabel>
            <br />
            <span style={{ fontSize: "15px" }}>{data.dataType}</span>
          </div>
          <ActiveStatusInShow status={data.active} />

          {data.dataType === "Numeric" && (
            <>
              <p />
              <div>
                <FormLabel style={{ fontSize: "13px" }}>Low absolute</FormLabel>
                <br />
                <span style={{ fontSize: "15px" }}>
                  {data.lowAbsolute ? data.lowAbsolute : <RemoveIcon />}
                </span>
              </div>
              <p />
              <div>
                <FormLabel style={{ fontSize: "13px" }}>High Absolute</FormLabel>
                <br />
                <span style={{ fontSize: "15px" }}>
                  {data.highAbsolute ? data.highAbsolute : <RemoveIcon />}
                </span>
              </div>
              <p />
              <div>
                <FormLabel style={{ fontSize: "13px" }}>Low Normal</FormLabel>
                <br />
                <span style={{ fontSize: "15px" }}>
                  {data.lowNormal ? data.lowNormal : <RemoveIcon />}
                </span>
              </div>
              <p />
              <div>
                <FormLabel style={{ fontSize: "13px" }}>High normal</FormLabel>
                <br />
                <span style={{ fontSize: "15px" }}>
                  {data.highNormal ? data.highNormal : <RemoveIcon />}
                </span>
              </div>
              <p />
              <div>
                <FormLabel style={{ fontSize: "13px" }}>Unit</FormLabel>
                <br />
                <span style={{ fontSize: "15px" }}>{data.unit ? data.unit : <RemoveIcon />}</span>
              </div>
            </>
          )}
          {data.dataType === "Coded" && (
            <div>
              <FormLabel style={{ fontSize: "13px" }}>Answers</FormLabel>
              <br />
              {data.conceptAnswers &&
                orderBy(data.conceptAnswers, "order").map((answer, index) => {
                  return (
                    !answer.voided && (
                      <div key={index} style={{ width: "100%" }}>
                        <TextField
                          id="name"
                          value={answer.answerConcept.name}
                          style={{ width: "300px" }}
                          margin="normal"
                          disabled={true}
                        />
                        <FormControlLabel
                          control={
                            <Checkbox checked={answer.abnormal ? true : false} name="abnormal" />
                          }
                          label="abnormal"
                          key={answer.uuid}
                          style={{ marginLeft: "5px" }}
                          disabled={true}
                        />
                        <FormControlLabel
                          control={
                            <Checkbox checked={answer.unique ? true : false} name="unique" />
                          }
                          label="unique"
                          key={answer.uuid}
                          disabled={true}
                        />
                      </div>
                    )
                  );
                })}
              {data.conceptAnswers === undefined && <RemoveIcon />}
            </div>
          )}

          <p />
          <div>
            <FormLabel style={{ fontSize: "13px" }}>Key values</FormLabel>
            <br />
            {data.keyValues &&
              data.keyValues.map((keyValue, index) => {
                return (
                  <div key={index}>
                    <TextField
                      id="outlined-required"
                      label="Key"
                      variant="outlined"
                      disabled={true}
                      value={keyValue.key}
                    />
                    <TextField
                      id="outlined-required"
                      label="Value"
                      variant="outlined"
                      value={keyValue.value}
                      disabled={true}
                      style={{ marginLeft: "10px" }}
                    />
                    <p />
                  </div>
                );
              })}
            {(isEmpty(data.keyValues) || data.keyValues === null) && <RemoveIcon />}
          </div>

          <p />

          <>
            {data.dataType !== "NA" && (
              <>
                <FormLabel style={{ fontSize: "13px" }}>Used in forms</FormLabel>
                <br />
                {isEmpty(usage.forms) && (
                  <span style={{ fontSize: "15px" }}>Not used in the form.</span>
                )}

                {usage.forms && (
                  <ul>
                    {" "}
                    {usage.forms.map((form, index) => {
                      return (
                        <>
                          <li key={index}>
                            <a href={`#/appDesigner/forms/${form.formUUID}`}>{form.formName}</a>
                            <p />
                          </li>
                        </>
                      );
                    })}
                  </ul>
                )}
              </>
            )}

            <FormLabel style={{ fontSize: "13px" }}>Answer to</FormLabel>
            <br />
            {isEmpty(usage.concepts) && (
              <span style={{ fontSize: "15px" }}>Not used in any answer.</span>
            )}
            {usage.concepts && (
              <ul>
                {usage.concepts.map(concept => {
                  return (
                    <>
                      <li key={concept.uuid}>
                        <a href={`#/appDesigner/concept/${concept.uuid}/edit`}>{concept.name}</a>
                      </li>
                    </>
                  );
                })}{" "}
              </ul>
            )}
          </>

          <p />
          <Audit {...data} />
        </div>

        {editAlert && <Redirect to={"/appdesigner/concept/" + props.match.params.uuid + "/edit"} />}
      </Box>
    </>
  );
}

export default withRouter(ConceptDetails);
