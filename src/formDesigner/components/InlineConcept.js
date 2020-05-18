import React from "react";
import PropTypes from "prop-types";
import NumericConcept from "./NumericConcept";
import { Input, InputLabel, Select, Button, FormControl } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import { CodedConceptUI } from "./CodedConcept";
import MenuItem from "@material-ui/core/MenuItem";
import { inlineConceptDataType } from "../common/constants";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { BackButton } from "./FormElementDetails";

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
            style={{ width: "200px", marginBottom: "10px" }}
          >
            {inlineConceptDataType.map(datatype => {
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

      {props.formElementData.inlineConceptDataType === "Coded" && (
        <>
          <DragDropContext onDragEnd={props.onDragInlineCodedConceptAnswer}>
            <Droppable droppableId={"Group" + props.groupIndex + "-" + props.index}>
              {provided => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {props.formElementData.inlineCodedAnswers.map((answer, index) => {
                    return (
                      <Draggable draggableId={"Element" + index} index={index} key={index}>
                        {provided => (
                          <Grid
                            container
                            // style={{ border: "1px solid #ccc", margin: "2px" }}
                            key={index}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            ref={provided.innerRef}
                          >
                            <CodedConceptUI
                              answer={answer}
                              elementIndex={props.index}
                              index={index}
                              groupIndex={props.groupIndex}
                              onDeleteAnswer={props.onDeleteInlineConceptCodedAnswerDelete}
                              onChangeAnswerName={props.handleInlineCodedConceptAnswers}
                              onToggleAnswerField={props.onToggleInlineConceptCodedAnswerAttribute}
                              inlineConcept={true}
                              key={index}
                            />
                          </Grid>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </>
      )}
      {props.formElementData.inlineConceptDataType === "Coded" && (
        <>
          <br />
          <Button
            color="primary"
            margin="normal"
            onClick={event => props.handleInlineCodedAnswerAddition(props.groupIndex, props.index)}
          >
            Add new answer
          </Button>
          <br />
        </>
      )}

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
