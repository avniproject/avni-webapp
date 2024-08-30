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
import RemoveIcon from "@material-ui/icons/Remove";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import { withRouter } from "react-router-dom";
import { isEmpty, isNil, orderBy } from "lodash";
import { BooleanStatusInShow } from "../../common/components/BooleanStatusInShow";
import { SystemInfo } from "./SystemInfo";
import UserInfo from "../../common/model/UserInfo";
import { connect } from "react-redux";
import { Privilege } from "openchs-models";

function ConceptDetails({ userInfo, ...props }) {
  const [editAlert, setEditAlert] = useState(false);
  const [data, setData] = useState({});
  const [usage, setUsage] = useState({});
  const [addressLevelTypes, setAddressLevelTypes] = useState([]);
  const [subjectTypeOptions, setSubjectTypeOptions] = React.useState([]);
  useEffect(() => {
    http.get("/web/concept/" + props.match.params.uuid).then(response => {
      setData(response.data);
      if (response.data.dataType === "Location") {
        http.get("/addressLevelType/?page=0&size=10&sort=level%2CDESC").then(response => {
          if (response.status === 200) {
            const addressLevelTypes = response.data.content.map(addressLevelType => ({
              label: addressLevelType.name,
              value: addressLevelType.uuid,
              level: addressLevelType.level,
              parent: addressLevelType.parent
            }));
            setAddressLevelTypes(addressLevelTypes);
          }
        });
      }

      if (response.data.dataType === "Subject") {
        http.get("/web/operationalModules").then(response => {
          setSubjectTypeOptions(response.data.subjectTypes);
        });
      }
    });
    http.get("/web/concept/usage/" + props.match.params.uuid).then(response => {
      setUsage(response.data);
    });
  }, [props.match.params.uuid]);

  const hasEditPrivilege = UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.EditConcept);
  return (
    <>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Title title={"Concept: " + data.name} />
        {hasEditPrivilege && (
          <Grid container item sm={12} style={{ justifyContent: "flex-end" }}>
            <Button color="primary" type="button" onClick={() => setEditAlert(true)}>
              <EditIcon />
              Edit
            </Button>
          </Grid>
        )}
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
          <BooleanStatusInShow status={data.active} label={"Active"} />

          {data.dataType === "Numeric" && (
            <>
              <p />
              <div>
                <FormLabel style={{ fontSize: "13px" }}>Low absolute</FormLabel>
                <br />
                <span style={{ fontSize: "15px" }}>{!isNil(data.lowAbsolute) ? data.lowAbsolute : <RemoveIcon />}</span>
              </div>
              <p />
              <div>
                <FormLabel style={{ fontSize: "13px" }}>High Absolute</FormLabel>
                <br />
                <span style={{ fontSize: "15px" }}>{!isNil(data.highAbsolute) ? data.highAbsolute : <RemoveIcon />}</span>
              </div>
              <p />
              <div>
                <FormLabel style={{ fontSize: "13px" }}>Low Normal</FormLabel>
                <br />
                <span style={{ fontSize: "15px" }}>{!isNil(data.lowNormal) ? data.lowNormal : <RemoveIcon />}</span>
              </div>
              <p />
              <div>
                <FormLabel style={{ fontSize: "13px" }}>High normal</FormLabel>
                <br />
                <span style={{ fontSize: "15px" }}>{!isNil(data.highNormal) ? data.highNormal : <RemoveIcon />}</span>
              </div>
              <p />
              <div>
                <FormLabel style={{ fontSize: "13px" }}>Unit</FormLabel>
                <br />
                <span style={{ fontSize: "15px" }}>{!isNil(data.unit) ? data.unit : <RemoveIcon />}</span>
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
                        <TextField id="name" value={answer.answerConcept.name} style={{ width: "300px" }} margin="normal" disabled={true} />
                        <FormControlLabel
                          control={<Checkbox checked={!!answer.abnormal} name="abnormal" />}
                          label="abnormal"
                          style={{ marginLeft: "5px" }}
                          disabled={true}
                        />
                        <FormControlLabel control={<Checkbox checked={!!answer.unique} name="unique" />} label="unique" disabled={true} />
                      </div>
                    )
                  );
                })}
              {data.conceptAnswers === undefined && <RemoveIcon />}
            </div>
          )}
          {data.dataType === "Location" && addressLevelTypes.length > 0 && (
            <div>
              <p />
              <div>
                <FormLabel style={{ fontSize: "13px" }}>Within Catchment</FormLabel>
                <br />
                <span style={{ fontSize: "15px" }}>
                  {data.keyValues.find(keyValue => keyValue.key === "isWithinCatchment").value === true ? "Yes" : "No"}
                </span>
              </div>
              <p />
              <div>
                <FormLabel style={{ fontSize: "13px" }}>Lowest Location Level(s)</FormLabel>
                <br />
                <span style={{ fontSize: "15px" }}>
                  {addressLevelTypes
                    .filter(addressLevelType =>
                      data.keyValues.find(keyValue => keyValue.key === "lowestAddressLevelTypeUUIDs").value.includes(addressLevelType.value)
                    )
                    .map((addressLevelType, index, array) => addressLevelType.label + (index === array.length - 1 ? "" : ", "))}
                </span>
              </div>
              <p />
              <div>
                <FormLabel style={{ fontSize: "13px" }}>Highest Location Level</FormLabel>
                <br />
                <span style={{ fontSize: "15px" }}>
                  {data.keyValues.find(keyValue => keyValue.key === "highestAddressLevelTypeUUID") !== undefined ? (
                    addressLevelTypes.find(
                      addressLevelType =>
                        data.keyValues.find(keyValue => keyValue.key === "highestAddressLevelTypeUUID").value === addressLevelType.value
                    ).label
                  ) : (
                    <RemoveIcon />
                  )}
                </span>
              </div>
            </div>
          )}
          {data.dataType === "Subject" && subjectTypeOptions.length > 0 && (
            <div>
              <div>
                <FormLabel style={{ fontSize: "13px" }}>Subject Type</FormLabel>
                <br />
                <span style={{ fontSize: "15px" }}>
                  {
                    subjectTypeOptions.find(
                      subjectType => data.keyValues.find(keyValue => keyValue.key === "subjectTypeUUID").value === subjectType.uuid
                    ).name
                  }
                </span>
              </div>
            </div>
          )}

          <p />
          <div>
            <FormLabel style={{ fontSize: "13px" }}>Key values</FormLabel>
            <br />
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
                      style={{ width: "350px" }}
                      value={keyValue.key}
                    />
                    <TextField
                      id="outlined-required"
                      label="Value"
                      variant="outlined"
                      value={keyValue.value}
                      disabled={true}
                      style={{ marginLeft: "10px", width: "350px" }}
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
                {isEmpty(usage.forms) && <span style={{ fontSize: "15px" }}>Not used in the form.</span>}

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
            {isEmpty(usage.concepts) && <span style={{ fontSize: "15px" }}>Not used in any answer.</span>}
            {usage.concepts && (
              <ul>
                {usage.concepts.map(concept => {
                  return (
                    <>
                      <li key={concept.uuid}>
                        <a href={`#/appDesigner/concept/${concept.uuid}/show`}>{concept.name}</a>
                      </li>
                    </>
                  );
                })}{" "}
              </ul>
            )}
          </>

          <p />
          <SystemInfo {...data} />
        </div>

        {editAlert && <Redirect to={"/appdesigner/concept/" + props.match.params.uuid + "/edit"} />}
      </Box>
    </>
  );
}

const mapStateToProps = state => ({
  userInfo: state.app.userInfo
});

export default withRouter(connect(mapStateToProps)(ConceptDetails));
