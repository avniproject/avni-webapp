import React from "react";
import NumericConcept from "./NumericConcept";
import { Button, FormControl, Input, Grid, MenuItem, Box } from "@mui/material";
import { CodedConceptAnswer } from "./CodedConcept";
import { inlineConceptDataType } from "../common/constants";
import { BackButton } from "./FormElementDetails";
import { AvniSelect } from "../../common/components/AvniSelect";
import { AvniFormLabel } from "../../common/components/AvniFormLabel";
import { LocationConcept } from "./LocationConcept";
import { SubjectConcept } from "./SubjectConcept";
import { PhoneNumberConcept } from "./PhoneNumberConcept";
import { filter, includes, replace, size } from "lodash";
import http from "../../common/utils/httpClient";
import { EncounterConcept } from "./EncounterConcept";

function getKeyValues(obj) {
  return Object.keys(obj).map(key => ({ key: key, value: obj[key] }));
}

function InlineConcept(props) {
  const [operationalModules, setOperationalModules] = React.useState({});
  React.useEffect(() => {
    http.get("/web/operationalModules").then(response => {
      setOperationalModules(response.data);
    });
  }, []);

  const renderInlinePhoneNumber = () => {
    const onKeyValueChange = ({ key, value }) => props.handleInlinePhoneNumberAttributes(props.groupIndex, key, value, props.index);
    return (
      <PhoneNumberConcept
        onKeyValueChange={(keyValue, index) => onKeyValueChange(keyValue)}
        checked={props.formElementData.inlinePhoneNumberDataTypeKeyValues.verifyPhoneNumber}
      />
    );
  };

  return (
    <>
      {props.formElementData.inlineConceptErrorMessage.inlineConceptError !== "" && (
        <div style={{ color: "red", fontSize: "10px" }}>{props.formElementData.inlineConceptErrorMessage.inlineConceptError}</div>
      )}
      <Grid item={true} sm={12}>
        <FormControl fullWidth>
          <AvniFormLabel label={"Concept Name"} toolTipKey={"APP_DESIGNER_CONCEPT_NAME"} />
          <Input
            id="elementName"
            value={props.formElementData.inlineConceptName}
            autoComplete="off"
            onChange={event =>
              props.handleGroupElementChange(props.groupIndex, "inlineConceptName", replace(event.target.value, "|", ""), props.index)
            }
          />
        </FormControl>
      </Grid>
      {props.formElementData.inlineConceptErrorMessage.name !== "" && (
        <div style={{ color: "red", fontSize: "10px" }}>{props.formElementData.inlineConceptErrorMessage.name}</div>
      )}
      <Grid item={true} sm={12}>
        <AvniSelect
          label="Datatype *"
          value={props.formElementData.inlineConceptDataType}
          onChange={event => props.handleGroupElementChange(props.groupIndex, "inlineConceptDataType", event.target.value, props.index)}
          style={{ width: "200px", marginBottom: "10px" }}
          required
          options={filter(inlineConceptDataType, t => !includes(props.dataTypesToIgnore, t)).map(datatype => {
            return (
              <MenuItem value={datatype} key={datatype}>
                {datatype}
              </MenuItem>
            );
          })}
          toolTipKey={"APP_DESIGNER_CONCEPT_DATA_TYPE"}
        />
      </Grid>
      {props.formElementData.inlineConceptErrorMessage.dataType !== "" && (
        <div style={{ color: "red", fontSize: "10px" }}>{props.formElementData.inlineConceptErrorMessage.dataType}</div>
      )}
      {props.formElementData.inlineConceptDataType === "Numeric" && (
        <NumericConcept
          onNumericConceptAttributeAssignment={props.handleInlineNumericAttributes}
          numericDataTypeAttributes={props.formElementData.inlineNumericDataTypeAttributes}
          inlineConcept={true}
          groupIndex={props.groupIndex}
          index={props.index}
        />
      )}
      {props.formElementData.inlineConceptDataType === "Coded" && (
        <Box
          sx={{
            mt: 2
          }}
        >
          <Button type="button" color="primary" onClick={() => props.onAlphabeticalSort(props.groupIndex, props.index)}>
            Sort alphabetically
          </Button>
          {props.formElementData.inlineCodedAnswers.map((answer, index) => {
            return (
              <Grid container key={index}>
                <CodedConceptAnswer
                  answer={answer}
                  elementIndex={props.index}
                  index={index}
                  groupIndex={props.groupIndex}
                  onDeleteAnswer={props.onDeleteInlineConceptCodedAnswerDelete}
                  onMoveUp={props.onMoveUp}
                  onMoveDown={props.onMoveDown}
                  onChangeAnswerName={props.handleInlineCodedConceptAnswers}
                  onToggleAnswerField={props.onToggleInlineConceptCodedAnswerAttribute}
                  inlineConcept={true}
                  key={index}
                  totalAnswers={size(props.formElementData.inlineCodedAnswers)}
                  onSelectAnswerMedia={() => props.onSelectAnswerMedia(answer)}
                />
              </Grid>
            );
          })}
        </Box>
      )}
      {props.formElementData.inlineConceptDataType === "Coded" && (
        <>
          <br />
          <Button color="primary" margin="normal" onClick={event => props.handleInlineCodedAnswerAddition(props.groupIndex, props.index)}>
            Add new answer
          </Button>
          <br />
        </>
      )}
      {props.formElementData.inlineConceptDataType === "Location" && (
        <>
          <LocationConcept
            updateConceptKeyValues={props.handleInlineLocationAttributes}
            keyValues={getKeyValues(props.formElementData.inlineLocationDataTypeKeyValues)}
            error={props.formElementData.inlineLocationDataTypeKeyValues.error}
            isCreatePage={false}
            inlineConcept={true}
            groupIndex={props.groupIndex}
            index={props.index}
          />
          <br />
        </>
      )}
      {props.formElementData.inlineConceptDataType === "Subject" && (
        <>
          <SubjectConcept
            updateKeyValues={props.handleInlineSubjectAttributes}
            keyValues={getKeyValues(props.formElementData.inlineSubjectDataTypeKeyValues)}
            error={props.formElementData.inlineSubjectDataTypeKeyValues.error}
            isCreatePage={false}
            inlineConcept={true}
            groupIndex={props.groupIndex}
            index={props.index}
            operationalModules={operationalModules}
          />
          <br />
        </>
      )}
      {props.formElementData.inlineConceptDataType === "Encounter" && (
        <>
          <EncounterConcept
            updateKeyValues={props.handleInlineEncounterAttributes}
            error={props.formElementData.inlineEncounterDataTypeKeyValues.error}
            isCreatePage={true}
            inlineConcept={true}
            groupIndex={props.groupIndex}
            index={props.index}
            operationalModules={operationalModules}
          />
          <br />
        </>
      )}
      {props.formElementData.inlineConceptDataType === "PhoneNumber" && renderInlinePhoneNumber()}
      <Button
        variant="contained"
        color="primary"
        margin="normal"
        onClick={event => props.onSaveInlineConcept(props.groupIndex, props.index)}
      >
        Save
      </Button>
      {props.formElementData.newFlag && (
        <BackButton
          handleConceptFormLibrary={props.handleConceptFormLibrary}
          groupIndex={props.groupIndex}
          elementIndex={props.index}
          style={{ marginLeft: "10px" }}
        />
      )}
    </>
  );
}

InlineConcept.propTypes = {};

export default InlineConcept;
