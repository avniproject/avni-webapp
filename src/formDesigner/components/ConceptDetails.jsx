import { useEffect, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import { httpClient as http } from "common/utils/httpClient";
import { useParams, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import { Title } from "react-admin";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormLabel from "@mui/material/FormLabel";
import { Grid } from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import _, { flatten, isEmpty, isNil, orderBy } from "lodash";
import { BooleanStatusInShow } from "../../common/components/BooleanStatusInShow";
import { SystemInfo } from "./SystemInfo";
import UserInfo from "../../common/model/UserInfo";
import { useSelector } from "react-redux";
import { Privilege } from "openchs-models";
import MediaService from "adminApp/service/MediaService";
import { MediaPreview } from "../../common/components/AvniMediaUpload";
import { canEditConcept } from "../util/ConceptPermissionUtil";

function NumericDetails({ data }) {
  return (
    <>
      <p />
      <div>
        <FormLabel style={{ fontSize: "13px" }}>Low absolute</FormLabel>
        <br />
        <span style={{ fontSize: "15px" }}>
          {!isNil(data.lowAbsolute) ? data.lowAbsolute : <RemoveIcon />}
        </span>
      </div>
      <p />
      <div>
        <FormLabel style={{ fontSize: "13px" }}>High Absolute</FormLabel>
        <br />
        <span style={{ fontSize: "15px" }}>
          {!isNil(data.highAbsolute) ? data.highAbsolute : <RemoveIcon />}
        </span>
      </div>
      <p />
      <div>
        <FormLabel style={{ fontSize: "13px" }}>Low Normal</FormLabel>
        <br />
        <span style={{ fontSize: "15px" }}>
          {!isNil(data.lowNormal) ? data.lowNormal : <RemoveIcon />}
        </span>
      </div>
      <p />
      <div>
        <FormLabel style={{ fontSize: "13px" }}>High normal</FormLabel>
        <br />
        <span style={{ fontSize: "15px" }}>
          {!isNil(data.highNormal) ? data.highNormal : <RemoveIcon />}
        </span>
      </div>
      <p />
      <div>
        <FormLabel style={{ fontSize: "13px" }}>Unit</FormLabel>
        <br />
        <span style={{ fontSize: "15px" }}>
          {!isNil(data.unit) ? data.unit : <RemoveIcon />}
        </span>
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
                <Grid
                  container
                  direction="row"
                  spacing={2}
                  style={{ width: "100%" }}
                  sx={{
                    alignItems: "center",
                  }}
                >
                  <Grid>
                    <TextField
                      id="name"
                      value={answerConcept.name}
                      style={{ width: "300px" }}
                      margin="normal"
                      disabled={true}
                    />
                  </Grid>
                  <Grid>
                    <FormControlLabel
                      control={
                        <Checkbox checked={!!answer.abnormal} name="abnormal" />
                      }
                      label="abnormal"
                      style={{ marginLeft: "5px" }}
                      disabled={true}
                    />
                  </Grid>
                  <Grid>
                    <FormControlLabel
                      control={
                        <Checkbox checked={!!answer.unique} name="unique" />
                      }
                      label="unique"
                      disabled={true}
                    />
                  </Grid>
                  {answerConcept.media &&
                    answerConcept.media.map((m) => (
                      <Grid>
                        <MediaPreview
                          mediaUrl={m.url}
                          mediaType={m.type}
                          width={40}
                          height={40}
                        />
                      </Grid>
                    ))}
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
          {data.keyValues.find(
            (keyValue) => keyValue.key === "isWithinCatchment",
          ).value === true
            ? "Yes"
            : "No"}
        </span>
      </div>
      <p />
      <div>
        <FormLabel style={{ fontSize: "13px" }}>
          Lowest Location Level(s)
        </FormLabel>
        <br />
        <span style={{ fontSize: "15px" }}>
          {addressLevelTypes
            .filter((addressLevelType) =>
              data.keyValues
                .find(
                  (keyValue) => keyValue.key === "lowestAddressLevelTypeUUIDs",
                )
                .value.includes(addressLevelType.value),
            )
            .map(
              (addressLevelType, index, array) =>
                addressLevelType.label +
                (index === array.length - 1 ? "" : ", "),
            )}
        </span>
      </div>
      <p />
      <div>
        <FormLabel style={{ fontSize: "13px" }}>
          Highest Location Level
        </FormLabel>
        <br />
        <span style={{ fontSize: "15px" }}>
          {data.keyValues.find(
            (keyValue) => keyValue.key === "highestAddressLevelTypeUUID",
          ) !== undefined ? (
            addressLevelTypes.find(
              (addressLevelType) =>
                data.keyValues.find(
                  (keyValue) => keyValue.key === "highestAddressLevelTypeUUID",
                ).value === addressLevelType.value,
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
              (subjectType) =>
                data.keyValues.find(
                  (keyValue) => keyValue.key === "subjectTypeUUID",
                ).value === subjectType.uuid,
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
      <FormLabel style={{ fontSize: "13px" }}>
        Used in forms (Form name &rarr; Page name &rarr; Question name)
      </FormLabel>
      <br />
      {isEmpty(forms) && (
        <span style={{ fontSize: "15px" }}>Not used in the form.</span>
      )}
      {forms && (
        <ul>
          {forms.map((form, index) => {
            return (
              <li key={index}>
                <a href={`#/appDesigner/forms/${form.formUUID}`}>
                  {form.formName}
                </a>{" "}
                &rarr; {form.formElementGroupName} &rarr;{" "}
                {!isNil(form.formElementQGGroupName)
                  ? form.formElementQGGroupName + " &rarr;"
                  : ""}{" "}
                {form.formElementName}
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
      {isEmpty(concepts) && (
        <span style={{ fontSize: "15px" }}>Not used in any answer.</span>
      )}
      {concepts && (
        <ul>
          {concepts.map((concept) => {
            return (
              concept.uuid &&
              !concept.voided && (
                <li key={concept.uuid}>
                  <a href={`#/appDesigner/concept/${concept.uuid}/show`}>
                    {concept.name}
                  </a>
                </li>
              )
            );
          })}
        </ul>
      )}
    </>
  );
}

function ConceptDetails() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const userInfo = useSelector((state) => state.app.userInfo);
  const organisation = useSelector((state) => state.app.organisation);
  const [editAlert, setEditAlert] = useState(false);
  const [data, setData] = useState({});
  const [usage, setUsage] = useState({});
  const [addressLevelTypes, setAddressLevelTypes] = useState([]);
  const [subjectTypeOptions, setSubjectTypeOptions] = useState([]);
  const [canEdit, setCanEdit] = useState(false);
  const [showEditWarning, setShowEditWarning] = useState(false);
  const hasPrivilege = UserInfo.hasPrivilege(
    userInfo,
    Privilege.PrivilegeType.EditConcept,
  );

  async function onLoad() {
    const conceptRes = (await http.get("/web/concept/" + uuid)).data;
    if (conceptRes.dataType === "Location") {
      const addressRes = await http.get(
        "/addressLevelType?page=0&size=10&sort=level%2CDESC",
      );
      if (addressRes.status === 200) {
        const addressLevelTypes = addressRes.data.content.map(
          (addressLevelType) => ({
            label: addressLevelType.name,
            value: addressLevelType.uuid,
            level: addressLevelType.level,
            parent: addressLevelType.parent,
          }),
        );
        setAddressLevelTypes(addressLevelTypes);
      }
    }
    if (conceptRes.dataType === "Subject") {
      const subjectRes = await http.get("/web/operationalModules");
      setSubjectTypeOptions(subjectRes.data.subjectTypes);
    }
    const usageRes = await http.get("/web/concept/usage/" + uuid);
    setUsage(usageRes.data);

    const conceptMediaSignedUrls = !isNil(conceptRes.media)
      ? await MediaService.getMultipleMedia(conceptRes.media.map((m) => m.url))
      : null;
    conceptRes.media = !isNil(conceptMediaSignedUrls)
      ? conceptRes.media.map((m) => {
          m.url = conceptMediaSignedUrls[m.url];
          return m;
        })
      : null;

    if (conceptRes.dataType === "Coded" && conceptRes.conceptAnswers) {
      const conceptAnswersWithMedia = conceptRes.conceptAnswers.filter(
        (ca) =>
          ca &&
          ca.answerConcept &&
          ca.answerConcept.media &&
          !_.isNil(ca.answerConcept.media),
      );
      const conceptAnswerMediaSignedUrls = await MediaService.getMultipleMedia(
        flatten(
          conceptAnswersWithMedia.map((ca) =>
            ca.answerConcept.media.map((cam) => cam.url),
          ),
        ),
      );

      conceptAnswersWithMedia.map((ca) =>
        ca.answerConcept.media.map(
          (cam) => (cam.url = conceptAnswerMediaSignedUrls[cam.url]),
        ),
      );
    }

    const canEditResult = canEditConcept(conceptRes, userInfo, organisation);
    setCanEdit(canEditResult);
    setShowEditWarning(!canEditResult || !hasPrivilege);

    setData(conceptRes);
  }

  useEffect(() => {
    onLoad();
  }, [uuid]);

  useEffect(() => {
    if (editAlert) {
      navigate(`/appdesigner/concept/${uuid}/edit`);
    }
  }, [editAlert, navigate, uuid]);

  return (
    <>
      <Box
        sx={{
          boxShadow: 2,
          p: 3,
          bgcolor: "background.paper",
        }}
      >
        <Title title={"Concept: " + data.name} />
        {canEdit && (
          <Grid
            container
            style={{ justifyContent: "flex-end" }}
            size={{
              sm: 12,
            }}
          >
            <Button
              color="primary"
              type="button"
              onClick={() => setEditAlert(true)}
            >
              <EditIcon />
              Edit
            </Button>
          </Grid>
        )}
        {showEditWarning && (
          <Grid
            container
            style={{ justifyContent: "flex-end", marginBottom: "1rem" }}
          >
            <Box
              sx={{
                backgroundColor: "#fff3cd",
                border: "1px solid #ffeeba",
                color: "#856404",
                padding: "0.5rem 0.75rem",
                borderRadius: "0.25rem",
                fontSize: "0.875rem",
              }}
            >
              {!hasPrivilege
                ? "You don't have the privilege to modify the concept"
                : "This concept is shared by multiple organisations and hence cannot be edited. Create a new one if needed."}
            </Box>
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

          <p />
          {data.media &&
            data.media.map((m) => (
              <div>
                <FormLabel style={{ fontSize: "13px" }}>{m.type}</FormLabel>
                <br />
                <MediaPreview
                  mediaUrl={m.url}
                  mediaType={m.type}
                  width={80}
                  height={80}
                />
              </div>
            ))}

          <BooleanStatusInShow status={data.active} label={"Active"} />

          {data.dataType === "Numeric" && <NumericDetails data={data} />}

          {data.dataType === "Coded" && (
            <CodedConceptDetails conceptAnswers={data.conceptAnswers} />
          )}

          {data.dataType === "Location" && addressLevelTypes.length > 0 && (
            <LocationDetails
              data={data}
              addressLevelTypes={addressLevelTypes}
            />
          )}

          {data.dataType === "Subject" && subjectTypeOptions.length > 0 && (
            <SubjectDetail
              data={data}
              subjectTypeOptions={subjectTypeOptions}
            />
          )}

          <p />
          <KeyValueDetail keyValues={data.keyValues} />

          <p />

          {data.dataType !== "NA" && <UsedInForms forms={usage.forms} />}

          <p />
          <UsedAsAnswer concepts={usage.concepts} />

          <p />
          <SystemInfo {...data} />
        </div>
      </Box>
    </>
  );
}

export default ConceptDetails;
