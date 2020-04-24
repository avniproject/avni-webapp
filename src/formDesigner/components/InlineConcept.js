import React from "react";
import PropTypes from "prop-types";
import NumericConcept from "./NumericConcept";
import { Input, InputLabel, Select, Button, FormControl } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import MenuItem from "@material-ui/core/MenuItem";

function InlineConcept(props) {
  return (
    <>
      {props.formElementData.inlineConceptErrorMessage.inlineConceptError !== "" && (
        <div style={{ color: "red", fontSize: "10px" }}>
          {props.formElementData.inlineConceptErrorMessage.inlineConceptError}
        </div>
      )}
      <Grid item sm={12}>
        <FormControl fullWidth>
          <InputLabel htmlFor="elementNameDetails">Concept Name</InputLabel>
          <Input
            id="elementName"
            value={props.formElementData.inlineConceptName}
            autoComplete="off"
            onChange={event =>
              props.handleGroupElementChange(
                props.groupIndex,
                "inlineConceptName",
                event.target.value,
                props.index
              )
            }
          />
        </FormControl>
      </Grid>
      {props.formElementData.inlineConceptErrorMessage.name !== "" && (
        <div style={{ color: "red", fontSize: "10px" }}>
          {props.formElementData.inlineConceptErrorMessage.name}
        </div>
      )}
      <Grid item sm={12}>
        <FormControl>
          <InputLabel>Datatype *</InputLabel>
          <Select
            id="dataType"
            label="DataType"
            value={props.formElementData.inlineConceptDataType}
            onChange={event =>
              props.handleGroupElementChange(
                props.groupIndex,
                "inlineConceptDataType",
                event.target.value,
                props.index
              )
            }
            style={{ width: "140px" }}
          >
            {props.formElementData.availableDataTypes.map(datatype => {
              return (
                <MenuItem value={datatype} key={datatype}>
                  {datatype}
                </MenuItem>
              );
            })}
          </Select>
          {props.formElementData.inlineConceptErrorMessage.dataType !== "" && (
            <div style={{ color: "red", fontSize: "10px" }}>
              {props.formElementData.inlineConceptErrorMessage.dataType}
            </div>
          )}
        </FormControl>
      </Grid>
      {props.formElementData.inlineConceptDataType === "Numeric" && (
        <NumericConcept
          onNumericConceptAttributeAssignment={props.handleInlineNumericAttributes}
          numericDataTypeAttributes={props.formElementData.inlineNumericDataTypeAttributes}
          inlineConcept={true}
          groupIndex={props.groupIndex}
          index={props.index}
        />
      )}
      <Button
        fullWidth
        variant="contained"
        color="primary"
        margin="normal"
        onClick={event => props.onSaveInlineConcept(props.groupIndex, props.index)}
      >
        Save concept
      </Button>
    </>
  );
}

InlineConcept.propTypes = {};

export default InlineConcept;
