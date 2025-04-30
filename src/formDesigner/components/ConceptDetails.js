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
import MediaService from "adminApp/service/MediaService";
import { ImagePreview } from "../../common/components/AvniImageUpload";
import _ from "lodash";

function NumericDetails({ data }) {
  return (
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
  );
}

function CodedConceptDetails({ conceptAnswers }) {
  return (
    <div>
      <FormLabel style={{ fontSize: "13px" }}>Answers</FormLabel>
      <br />
      {conceptAnswers &&
        orderBy(conceptAnswers, "order").map((answer, index) => {
          const answerConcept = answer.answerConcept;
          return (
            !answer.voided && (
              <div key={index} style={{ width: "100%" }}>
                <Grid container direction="row" alignItems="center" spacing={2} style={{ width: "100%" }}>
                  <Grid item>
                    <TextField id="name" value={answerConcept.name} style={{ width: "300px" }} margin="normal" disabled={true} />
                  </Grid>
                  <Grid item>
                    <FormControlLabel
                      control={<Checkbox checked={!!answerConcept.abnormal} name="abnormal" />}
                      label="abnormal"
                      style={{ marginLeft: "5px" }}
                      disabled={true}
                    />
                  </Grid>
                  <Grid item>
                    <FormControlLabel
                      control={<Checkbox checked={!!answerConcept.unique} name="unique" />}
                      label="unique"
                      disabled={true}
                    />
                  </Grid>
                  {answerConcept.mediaUrl && (
                    <Grid item>
                      <ImagePreview iconPreview={answerConcept.mediaUrl} width={40} height={40} />
                    </Grid>
                  )}
                </Grid>
              </div>
            )
          );
        })}
      {conceptAnswers === undefined && <RemoveIcon />}
    </div>
  );
}

function LocationDetails({ data, addressLevelTypes }) {
  return (
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
  );
}

function SubjectDetail({ data, subjectTypeOptions }) {
  return (
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
  );
}

function KeyValueDetail({ keyValues }) {
  return (
    <div>
      <FormLabel style={{ fontSize: "13px" }}>Key values</FormLabel>
      <br />
      <br />
      {keyValues &&
        keyValues.map((keyValue, index) => {
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
      {(isEmpty(keyValues) || keyValues === null) && <RemoveIcon />}
    </div>
  );
}

function UsedInForms({ forms }) {
  return (
    <>
      <FormLabel style={{ fontSize: "13px" }}>Used in forms (Form name -> Page name -> Question name)</FormLabel>
      <br />
      {isEmpty(forms) && <span style={{ fontSize: "15px" }}>Not used in the form.</span>}
      {forms && (
        <ul>
          {forms.map((form, index) => {
            return (
              <li key={index}>
                <a href={`#/appDesigner/forms/${form.formUUID}`}>{form.formName}</a> -> {form.formElementGroupName} ->{" "}
                {!isNil(form.formElementQGGroupName) ? form.formElementQGGroupName + " ->" : ""} {form.formElementName}
                <p />
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function UsedAsAnswer({ concepts }) {
  return (
    <>
      <FormLabel style={{ fontSize: "13px" }}>Answer to</FormLabel>
      <br />
      {isEmpty(concepts) && <span style={{ fontSize: "15px" }}>Not used in any answer.</span>}
      {concepts && (
        <ul>
          {concepts.map(concept => {
            return (
              concept.uuid &&
              !concept.voided && (
                <li key={concept.uuid}>
                  <a href={`#/appDesigner/concept/${concept.uuid}/show`}>{concept.name}</a>
                </li>
              )
            );
          })}
        </ul>
      )}
    </>
  );
}

function ConceptDetails({ userInfo, ...props }) {
  const [editAlert, setEditAlert] = useState(false);
  const [data, setData] = useState({});
  const [usage, setUsage] = useState({});
  const [addressLevelTypes, setAddressLevelTypes] = useState([]);
  const [subjectTypeOptions, setSubjectTypeOptions] = React.useState([]);

  async function onLoad() {
    const conceptRes = (await http.get("/web/concept/" + props.match.params.uuid)).data;
    if (conceptRes.dataType === "Location") {
      const addressRes = await http.get("/addressLevelType?page=0&size=10&sort=level%2CDESC");
      if (addressRes.status === 200) {
        const addressLevelTypes = addressRes.data.content.map(addressLevelType => ({
          label: addressLevelType.name,
          value: addressLevelType.uuid,
          level: addressLevelType.level,
          parent: addressLevelType.parent
        }));
        setAddressLevelTypes(addressLevelTypes);
      }
    }
    if (conceptRes.dataType === "Subject") {
      const subjectRes = await http.get("/web/operationalModules");
      setSubjectTypeOptions(subjectRes.data.subjectTypes);
    }
    const usageRes = await http.get("/web/concept/usage/" + props.match.params.uuid);
    setUsage(usageRes.data);

    if (conceptRes.mediaUrl) {
      const mediaSignedUrl = await MediaService.getMedia(conceptRes.mediaUrl);
      conceptRes.mediaUrl = mediaSignedUrl;
    }

    if (conceptRes.dataType === "Coded") {
      const conceptAnswersWithMedia = conceptRes.conceptAnswers.filter(ca => !_.isNil(ca.answerConcept.mediaUrl));
      const mediaSignedUrls = await MediaService.getMultipleMedia(conceptAnswersWithMedia.map(ca => ca.answerConcept.mediaUrl));
      conceptRes.conceptAnswers = conceptRes.conceptAnswers.map((ca, index) => {
        if (!_.isNil(ca.answerConcept.mediaUrl)) {
          return {
            ...ca,
            answerConcept: {
              ...ca.answerConcept,
              mediaUrl: mediaSignedUrls[ca.answerConcept.mediaUrl]
            }
          };
        }
        return ca;
      });
    }

    setData(conceptRes);
  }

  useEffect(() => {
    onLoad();
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

          {data.dataType === "Numeric" && <NumericDetails data={data} />}

          {data.dataType === "Coded" && <CodedConceptDetails conceptAnswers={data.conceptAnswers} />}

          {data.dataType === "Location" && addressLevelTypes.length > 0 && (
            <LocationDetails data={data} addressLevelTypes={addressLevelTypes} />
          )}

          {data.dataType === "Subject" && subjectTypeOptions.length > 0 && (
            <SubjectDetail data={data} subjectTypeOptions={subjectTypeOptions} />
          )}

          <p />
          <KeyValueDetail keyValues={data.keyValues} />

          <p />
          {data.mediaUrl && (
            <div>
              <FormLabel style={{ fontSize: "13px" }}>{"Image"}</FormLabel>
              <br />
              <img src={data.mediaUrl} alt="Preview" />
            </div>
          )}

          <p />

          {data.dataType !== "NA" && <UsedInForms forms={usage.forms} />}

          <p />
          <UsedAsAnswer concepts={usage.concepts} />

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
