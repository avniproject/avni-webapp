import { useEffect, useReducer, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import { httpClient as http } from "common/utils/httpClient";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import { Title } from "react-admin";
import Button from "@mui/material/Button";
import FormLabel from "@mui/material/FormLabel";
import { Grid } from "@mui/material";
import { ShowSubjectType } from "../WorkFlow/ShowSubjectType";
import { get, identity } from "lodash";
import {
  findProgramEnrolmentForm,
  findProgramExitForm
} from "../domain/formMapping";
import { BooleanStatusInShow } from "../../common/components/BooleanStatusInShow";
import { SystemInfo } from "../../formDesigner/components/SystemInfo";
import RuleDisplay from "../components/RuleDisplay";
import { MessageReducer } from "../../formDesigner/components/MessageRule/MessageReducer";
import {
  getMessageRules,
  getMessageTemplates
} from "../service/MessageService";
import { useSelector } from "react-redux";
import MessageRules from "../../formDesigner/components/MessageRule/MessageRules";
import UserInfo from "../../common/model/UserInfo";
import { Privilege } from "openchs-models";

const ProgramShow = () => {
  const [program, setProgram] = useState({});
  const [editAlert, setEditAlert] = useState(false);
  const [formMappings, setFormMappings] = useState([]);
  const [subjectType, setSubjectType] = useState([]);
  const [{ rules, templates, templateFetchError }, rulesDispatch] = useReducer(
    MessageReducer,
    {
      rules: [],
      templates: []
    }
  );
  const entityType = "ProgramEnrolment";
  const { id } = useParams();
  const userInfo = useSelector(state => state.app.userInfo);

  useEffect(() => {
    getMessageRules(entityType, program.programId, rulesDispatch);
    return identity;
  }, [program]);

  useEffect(() => {
    getMessageTemplates(rulesDispatch);
    return identity;
  }, []);

  useEffect(() => {
    http
      .get(`/web/program/${id}`)
      .then(response => response.data)
      .then(result => {
        setProgram(result);
      })
      .catch(error => {
        console.error("Failed to fetch program:", error);
      });

    http
      .get("/web/operationalModules")
      .then(response => {
        const formMap = response.data.formMappings;
        formMap.forEach(l => (l["isVoided"] = false));
        setFormMappings(formMap);
        setSubjectType(response.data.subjectTypes);
      })
      .catch(error => {
        console.error("Failed to fetch operational modules:", error);
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
        <Title title={"Program: " + program.name} />
        {UserInfo.hasPrivilege(
          userInfo,
          Privilege.PrivilegeType.EditProgram
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
            <span style={{ fontSize: "15px" }}>{program.name}</span>
          </div>
          <p />
          <div>
            <FormLabel style={{ fontSize: "13px" }}>Subject Type</FormLabel>
            <br />
            <ShowSubjectType
              rowDetails={program}
              subjectType={subjectType}
              formMapping={formMappings}
              entityUUID="programUUID"
            />
          </div>
          <p />
          <div>
            <FormLabel style={{ fontSize: "13px" }}>Colour</FormLabel>
            <br />
            <div
              style={{
                width: "20px",
                height: "20px",
                border: "1px solid",
                background: program.colour
              }}
            />
          </div>
          <p />
          <BooleanStatusInShow status={program.active} label={"Active"} />
          <BooleanStatusInShow
            status={program.allowMultipleEnrolments}
            label={"Allow multiple active enrolments"}
          />
          <div>
            <FormLabel style={{ fontSize: "13px" }}>
              Program Subject Label
            </FormLabel>
            <br />
            <span style={{ fontSize: "15px" }}>
              {program.programSubjectLabel}
            </span>
          </div>
          <p />
          <div>
            <FormLabel style={{ fontSize: "13px" }}>Enrolment Form</FormLabel>
            <br />
            <span style={{ fontSize: "15px" }}>
              <a
                href={`#/appdesigner/forms/${get(
                  findProgramEnrolmentForm(formMappings, program),
                  "formUUID"
                )}`}
              >
                {get(
                  findProgramEnrolmentForm(formMappings, program),
                  "formName"
                )}
              </a>
            </span>
          </div>
          <p />
          <div>
            <FormLabel style={{ fontSize: "13px" }}>Exit Form</FormLabel>
            <br />
            <span style={{ fontSize: "15px" }}>
              <a
                href={`#/appdesigner/forms/${get(
                  findProgramExitForm(formMappings, program),
                  "formUUID"
                )}`}
              >
                {get(findProgramExitForm(formMappings, program), "formName")}
              </a>
            </span>
          </div>
          <p />
          <div>
            <FormLabel style={{ fontSize: "13px" }}>Organisation Id</FormLabel>
            <br />
            <span style={{ fontSize: "15px" }}>{program.organisationId}</span>
          </div>
          <p />
          <RuleDisplay
            fieldLabel={"Enrolment Summary Rule"}
            ruleText={program.enrolmentSummaryRule}
          />
          <p />
          <RuleDisplay
            fieldLabel={"Enrolment Eligibility Check Rule"}
            ruleText={program.enrolmentEligibilityCheckRule}
          />
          <p />
          <RuleDisplay
            fieldLabel={"Manual Enrolment Eligibility Check Rule"}
            ruleText={program.manualEnrolmentEligibilityCheckRule}
          />
          <p />
          <MessageRules
            templateFetchError={templateFetchError}
            rules={rules}
            templates={templates}
            onChange={identity}
            entityType={entityType}
            entityTypeId={program.programId}
            readOnly={true}
          />
          <SystemInfo {...program} />
        </div>

        {editAlert && <Navigate to={`/appDesigner/program/${id}`} />}
      </Box>
    </>
  );
};

export default ProgramShow;
