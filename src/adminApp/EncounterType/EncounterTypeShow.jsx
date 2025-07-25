import { useEffect, useReducer, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import _, { get, identity } from "lodash";
import EditIcon from "@mui/icons-material/Edit";
import { httpClient as http } from "common/utils/httpClient";
import { Navigate } from "react-router-dom";
import Box from "@mui/material/Box";
import { Title } from "react-admin";
import Button from "@mui/material/Button";
import FormLabel from "@mui/material/FormLabel";
import { Grid } from "@mui/material";
import { ShowPrograms, ShowSubjectType } from "../WorkFlow/ShowSubjectType";
import {
  findProgramEncounterCancellationForm,
  findProgramEncounterForm
} from "../domain/formMapping";
import { BooleanStatusInShow } from "../../common/components/BooleanStatusInShow";
import { SystemInfo } from "../../formDesigner/components/SystemInfo";
import RuleDisplay from "../components/RuleDisplay";
import { MessageReducer } from "../../formDesigner/components/MessageRule/MessageReducer";
import {
  getMessageRules,
  getMessageTemplates
} from "../service/MessageService";
import MessageRules from "../../formDesigner/components/MessageRule/MessageRules";
import UserInfo from "../../common/model/UserInfo";
import { Privilege } from "openchs-models";

const EncounterTypeShow = () => {
  const userInfo = useSelector(state => state.app.userInfo);

  const { id } = useParams();

  const [encounterType, setEncounterType] = useState({});
  const [editAlert, setEditAlert] = useState(false);
  const [formMappings, setFormMappings] = useState([]);
  const [subjectType, setSubjectType] = useState([]);
  const [program, setProgram] = useState([]);
  const [entityType, setEntityType] = useState();
  const [{ rules, templates, templateFetchError }, rulesDispatch] = useReducer(
    MessageReducer,
    {
      rules: [],
      templates: []
    }
  );

  useEffect(() => {
    getMessageRules(entityType, encounterType.encounterTypeId, rulesDispatch);
    return identity;
  }, [encounterType, entityType]);

  useEffect(() => {
    getMessageTemplates(rulesDispatch);
    return identity;
  }, []);

  useEffect(() => {
    http
      .get("/web/encounterType/" + id)
      .then(response => response.data)
      .then(result => {
        setEncounterType(result);

        http.get("/web/operationalModules").then(response => {
          const formMap = response.data.formMappings;
          formMap.map(l => (l["isVoided"] = false));

          const encounterTypeMappings = response.data.formMappings.filter(
            l => l.encounterTypeUUID === result.uuid
          );
          _.isNil(encounterTypeMappings[0].programUUID)
            ? setEntityType("Encounter")
            : setEntityType("ProgramEncounter");

          setFormMappings(formMap);
          setSubjectType(response.data.subjectTypes);
          setProgram(response.data.programs);
        });
      });
  }, [id]);

  return (
    <>
      <Box
        sx={{
          boxShadow: 2,
          p: 3,
          bgcolor: "background.paper"
        }}
      >
        <Title title={"Encounter Type : " + encounterType.name} />
        {UserInfo.hasPrivilege(
          userInfo,
          Privilege.PrivilegeType.EditEncounterType
        ) && (
          <Grid
            container
            style={{ justifyContent: "flex-end" }}
            size={{
              sm: 12
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
        <div className="container" style={{ float: "left" }}>
          <div>
            <FormLabel style={{ fontSize: "13px" }}>Name</FormLabel>
            <br />
            <span style={{ fontSize: "15px" }}>{encounterType.name}</span>
          </div>
          <p />
          <div>
            <FormLabel style={{ fontSize: "13px" }}>Subject Type</FormLabel>
            <br />
            <ShowSubjectType
              rowDetails={encounterType}
              subjectType={subjectType}
              formMapping={formMappings}
              entityUUID="encounterTypeUUID"
            />
          </div>
          <p />
          <div>
            <FormLabel style={{ fontSize: "13px" }}>Program</FormLabel>
            <br />
            <ShowPrograms
              rowDetails={encounterType}
              program={program}
              formMapping={formMappings}
              setMapping={setFormMappings}
            />
          </div>
          <p />
          <BooleanStatusInShow status={encounterType.active} label={"Active"} />
          <p />
          <BooleanStatusInShow
            status={encounterType.immutable}
            label={"Immutable"}
          />
          <div>
            <FormLabel style={{ fontSize: "13px" }}>Encounter Form</FormLabel>
            <br />
            <span style={{ fontSize: "15px" }}>
              <a
                href={`#/appdesigner/forms/${get(
                  findProgramEncounterForm(formMappings, encounterType),
                  "formUUID"
                )}`}
              >
                {get(
                  findProgramEncounterForm(formMappings, encounterType),
                  "formName"
                )}
              </a>
            </span>
          </div>
          <p />
          <div>
            <FormLabel style={{ fontSize: "13px" }}>
              Encounter Cancellation Form
            </FormLabel>
            <br />
            <span style={{ fontSize: "15px" }}>
              <a
                href={`#/appdesigner/forms/${get(
                  findProgramEncounterCancellationForm(
                    formMappings,
                    encounterType
                  ),
                  "formUUID"
                )}`}
              >
                {get(
                  findProgramEncounterCancellationForm(
                    formMappings,
                    encounterType
                  ),
                  "formName"
                )}
              </a>
            </span>
          </div>
          <p />
          <div>
            <FormLabel style={{ fontSize: "13px" }}>Organisation Id</FormLabel>
            <br />
            <span style={{ fontSize: "15px" }}>
              {encounterType.organisationId}
            </span>
          </div>
          <p />

          <RuleDisplay
            fieldLabel={"Encounter Eligibility Check Rule"}
            ruleText={encounterType.encounterEligibilityCheckRule}
          />
          <p />
          <MessageRules
            templateFetchError={templateFetchError}
            rules={rules}
            templates={templates}
            onChange={identity}
            entityType={entityType}
            entityTypeId={encounterType.encounterTypeId}
            readOnly={true}
          />
          <p />
          <SystemInfo {...encounterType} />
        </div>

        {editAlert && <Navigate to={"/appDesigner/encounterType/" + id} />}
      </Box>
    </>
  );
};

export default EncounterTypeShow;
